import { randomUUID } from 'crypto';
import type {
  NetworkPattern,
  NetworkSnapshot,
  WalkLeg,
  TransferLink,
} from './network.types';
import { transferContentHash } from './transfer-review';

// Synthetic topology only: these fixtures are not field-verified Kigali service.
export const pattern = (route: string, ids: string[]): NetworkPattern => ({
  id: randomUUID(),
  routeId: route,
  routeNumber: route,
  routeName: route,
  agency: 'Test operator',
  sourceTripId: route,
  sourceShapeId: null,
  direction: '0',
  headsign: ids[ids.length - 1],
  enabled: true,
  geometry: null,
  fare: null,
  stops: ids.map((id, sequence) => ({
    id,
    code: id,
    name: id,
    aliases: [],
    coordinates: [30 + id.charCodeAt(0) / 10000, -1.95],
    sequence,
    sourceSequence: sequence + 1,
    elapsedSeconds: sequence * 120,
    shapeIndex: null,
  })),
  service: {
    sourceId: 'test',
    validFrom: '2019-01-01',
    validTo: '2021-01-01',
    weekdays: [true, true, true, true, true, true, true],
    exceptions: [],
    windows: [],
  },
});
export const snapshot = (): NetworkSnapshot => ({
  patterns: [
    pattern('101', ['A', 'B', 'C']),
    pattern('202', ['C', 'D', 'E']),
    pattern('303', ['E', 'F']),
  ],
  transfers: [],
});
// Synthetic approval for isolated tests only, not evidence about real crossings.
export function reviewedFixtureTransfer(
  snapshot: NetworkSnapshot,
  link: TransferLink
): TransferLink {
  const stops = new Map(
    snapshot.patterns.flatMap((p) => p.stops.map((s) => [s.id, s] as const))
  );
  const t: TransferLink = {
    ...link,
    pathKind: 'surveyed',
    source: 'synthetic-test-path',
    instructions: [
      'Follow the synthetic test pathway to the next boarding point.',
    ],
    reviewed: true,
  };
  t.review = {
    reviewerId: '00000000-0000-4000-8000-000000000001',
    reviewedAt: '2026-08-30T12:00:00Z',
    evidenceUrl: 'https://example.org/synthetic-test-only',
    notes: 'Synthetic fixture, not a reviewed real-world pedestrian crossing.',
    contentHash: transferContentHash(t, stops),
  };
  return t;
}
export const access = (id: string, distanceMeters = 0): Map<string, WalkLeg> =>
  new Map([
    [
      id,
      {
        kind: 'walk',
        from: { stopId: id, name: id, coordinates: [30, -1.95] },
        to: { stopId: id, name: id, coordinates: [30, -1.95] },
        distanceMeters,
        durationSeconds: distanceMeters,
        geometry: [],
        instructions: [],
        quality: 'pedestrian-route',
      },
    ],
  ]);
