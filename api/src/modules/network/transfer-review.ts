import { createHash } from 'crypto';
import { isUUID } from 'class-validator';
import { distance, lineDistance, validCoordinates } from './geo';
import { httpsUrl, textValue } from './snapshot-schema';
import type { NetworkStop, TransferLink } from './network.types';

type Stops = Map<string, Pick<NetworkStop, 'id' | 'coordinates'>>;
export function snapshotRevision(value: unknown): string {
  const canonical = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(canonical)
      : v && typeof v === 'object'
        ? Object.fromEntries(
            Object.entries(v)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, entry]) => [k, canonical(entry)])
          )
        : v;
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
}
export function transferContentHash(t: TransferLink, stops: Stops): string {
  return createHash('sha256')
    .update(
      JSON.stringify([
        t.id,
        t.fromStopId,
        t.toStopId,
        stops.get(t.fromStopId)?.coordinates,
        stops.get(t.toStopId)?.coordinates,
        t.geometry,
        t.distanceMeters,
        t.durationSeconds,
        t.source,
        t.pathKind,
        t.instructions ?? [],
      ])
    )
    .digest('hex');
}
export function transferPathIssues(t: TransferLink, stops: Stops): string[] {
  const from = stops.get(t.fromStopId),
    to = stops.get(t.toStopId);
  if (!from || !to || from.id === to.id)
    return ['Select two distinct, existing boarding points.'];
  if (
    !Array.isArray(t.geometry) ||
    t.geometry.length < 2 ||
    t.geometry.length > 1000 ||
    !t.geometry.every(validCoordinates)
  )
    return ['Supply the actual pedestrian path, not a guessed connection.'];
  const issues: string[] = [];
  if (
    !['surveyed', 'pedestrian-provider'].includes(t.pathKind || '') ||
    !textValue(t.source, 2000)
  )
    issues.push('Identify the surveyed or pedestrian-provider source.');
  if (
    t.distanceMeters === null ||
    !Number.isFinite(t.distanceMeters) ||
    t.distanceMeters <= 0 ||
    t.distanceMeters > 400 ||
    t.durationSeconds === null ||
    !Number.isInteger(t.durationSeconds) ||
    t.durationSeconds <= 0
  )
    issues.push(
      'Supply a positive walking distance (at most 400 m) and duration.'
    );
  if (
    distance(from.coordinates, t.geometry[0]) > 30 ||
    distance(to.coordinates, t.geometry[t.geometry.length - 1]) > 30 ||
    lineDistance(t.geometry) > (t.distanceMeters ?? 0) + 10
  )
    issues.push(
      'The pedestrian geometry must connect both stops and fit the reported distance.'
    );
  if (!t.instructions?.length || t.instructions.some((v) => !textValue(v, 500)))
    issues.push('Supply passenger walking and crossing instructions.');
  return issues;
}
export function isReviewedTransfer(
  t: TransferLink,
  stops: Stops
): t is TransferLink & { distanceMeters: number; durationSeconds: number } {
  const r = t.review;
  return (
    t.reviewed === true &&
    Boolean(
      r &&
      typeof r.reviewerId === 'string' &&
      isUUID(r.reviewerId) &&
      httpsUrl(r.evidenceUrl) &&
      textValue(r.notes, 2000) &&
      Number.isFinite(Date.parse(r.reviewedAt)) &&
      r.contentHash === transferContentHash(t, stops)
    ) &&
    transferPathIssues(t, stops).length === 0
  );
}
