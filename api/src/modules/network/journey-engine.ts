import { createHash } from 'crypto';
import { lineDistance } from './geo';
import type {
  Journey,
  NetworkPattern,
  NetworkSnapshot,
  RideLeg,
  SearchOptions,
  WalkLeg,
} from './network.types';
import { enrichJourney } from './passenger-steps';
import {
  MIN_TRANSFER_SECONDS,
  PLANNING_HORIZON_SECONDS,
  scheduleRide,
} from './departure-timing';
import { kigaliDate } from './service-calendar';
import { isReviewedTransfer } from './transfer-review';

export interface SearchResult {
  journeys: Journey[];
  searchLimitReached: boolean;
}
interface Label {
  stopId: string;
  legs: (WalkLeg | RideLeg)[];
  walking: number;
  riding: number;
  usedRoutes: string[];
  arrivalMs: number | null;
}
interface RoutingGraph {
  boardings: Map<string, { pattern: NetworkPattern; index: number }[]>;
  transfers: Map<string, WalkLeg[]>;
}
const graphs = new WeakMap<NetworkSnapshot, RoutingGraph>();
export function compareJourneys(
  a: Journey,
  b: Journey,
  preference: SearchOptions['preference']
): number {
  return (
    (preference === 'least_walking'
      ? a.walkingMeters - b.walkingMeters || a.transfers - b.transfers
      : a.transfers - b.transfers || a.walkingMeters - b.walkingMeters) ||
    a.ridingMeters - b.ridingMeters ||
    a.id.localeCompare(b.id)
  );
}
export function rideLeg(
  p: NetworkPattern,
  start: number,
  end: number
): RideLeg {
  const board = p.stops[start],
    alight = p.stops[end];
  const stops = p.stops.slice(start, end + 1);
  const hasShape =
    p.geometry &&
    board.shapeIndex !== null &&
    alight.shapeIndex !== null &&
    alight.shapeIndex > board.shapeIndex;
  const geometry = hasShape
    ? p.geometry!.slice(board.shapeIndex!, alight.shapeIndex! + 1)
    : stops.map((s) => s.coordinates);
  const duration =
    board.elapsedSeconds !== null && alight.elapsedSeconds !== null
      ? alight.elapsedSeconds - board.elapsedSeconds
      : null;
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kigali',
  }).format(new Date());
  const fare =
    p.fare?.verified && p.fare.validFrom <= today && p.fare.validTo >= today
      ? p.fare
      : null;
  return {
    kind: 'ride',
    patternId: p.id,
    routeId: p.routeId,
    routeNumber: p.routeNumber,
    agency: p.agency,
    headsign: p.headsign,
    board,
    alight,
    stops,
    geometry,
    geometryQuality: hasShape ? 'source-shape' : 'schematic',
    distanceMeters: Math.round(lineDistance(geometry)),
    durationSeconds: duration !== null && duration >= 0 ? duration : null,
    fare,
  };
}

/** Bounded, transfer-round label search. Stop occurrences, not endpoint names, define ride edges. */
function graphFor(snapshot: NetworkSnapshot): RoutingGraph {
  const existing = graphs.get(snapshot);
  if (existing) return existing;
  const boardings = new Map<
    string,
    { pattern: NetworkPattern; index: number }[]
  >();
  const stopLookup = new Map(
    snapshot.patterns.flatMap((p) => p.stops.map((s) => [s.id, s] as const))
  );
  for (const pattern of snapshot.patterns.filter((p) => p.enabled))
    for (let index = 0; index < pattern.stops.length - 1; index++) {
      const id = pattern.stops[index].id;
      boardings.set(id, [...(boardings.get(id) || []), { pattern, index }]);
    }
  const transfers = new Map<string, WalkLeg[]>();
  for (const t of snapshot.transfers.filter((t) =>
    isReviewedTransfer(t, stopLookup)
  )) {
    const from = stopLookup.get(t.fromStopId),
      to = stopLookup.get(t.toStopId);
    if (!from || !to) continue;
    transfers.set(from.id, [
      ...(transfers.get(from.id) || []),
      {
        kind: 'walk',
        from: {
          stopId: from.id,
          name: from.name,
          coordinates: from.coordinates,
        },
        to: { stopId: to.id, name: to.name, coordinates: to.coordinates },
        distanceMeters: t.distanceMeters!,
        durationSeconds: t.durationSeconds!,
        geometry: t.geometry,
        quality: 'reviewed-transfer',
        instructions: t.instructions!,
      },
    ]);
  }
  const graph = { boardings, transfers };
  graphs.set(snapshot, graph);
  return graph;
}
export function searchJourneys(
  snapshot: NetworkSnapshot,
  access: Map<string, WalkLeg>,
  egress: Map<string, WalkLeg>,
  options: SearchOptions
): SearchResult {
  const { boardings, transfers } = graphFor(snapshot);
  const start = options.departureAt ? Date.parse(options.departureAt) : null;
  const horizon = start === null ? 0 : start + PLANNING_HORIZON_SECONDS * 1000;
  const maxExpansions = options.limits?.expansions ?? 150000;
  const maxFrontier = options.limits?.frontier ?? 2000;
  const maxLabels = options.limits?.labelsPerState ?? 4;
  let frontier: Label[] = [...access].map(([stopId, leg]) => ({
    stopId,
    legs: leg.distanceMeters ? [leg] : [],
    walking: leg.distanceMeters,
    riding: 0,
    usedRoutes: [],
    arrivalMs: start === null ? null : start + leg.durationSeconds * 1000,
  }));
  const results: Journey[] = [];
  let expansions = 0;
  let searchLimitReached = false;
  for (
    let round = 0;
    round <= options.maxTransfers && frontier.length;
    round++
  ) {
    const next = new Map<string, Label[]>();
    const retain = (label: Label) => {
      const key = `${label.stopId}|${label.usedRoutes.slice().sort().join(',')}`;
      const previous = next.get(key) || [];
      const dominates = (a: Label, b: Label) =>
        a.walking <= b.walking &&
        a.riding <= b.riding &&
        (a.arrivalMs === null
          ? b.arrivalMs === null
          : b.arrivalMs !== null && a.arrivalMs <= b.arrivalMs);
      if (previous.some((p) => dominates(p, label))) return;
      const retained = [
        ...previous.filter((p) => !dominates(label, p)),
        label,
      ].sort((a, b) => a.walking - b.walking || a.riding - b.riding);
      if (retained.length > maxLabels) searchLimitReached = true;
      next.set(key, retained.slice(0, maxLabels));
    };
    for (const label of frontier)
      for (const { pattern, index } of boardings.get(label.stopId) || []) {
        if (label.usedRoutes.includes(pattern.routeId)) continue;
        for (let end = index + 1; end < pattern.stops.length; end++) {
          if (++expansions > maxExpansions) {
            searchLimitReached = true;
            break;
          }
          let ride = rideLeg(pattern, index, end);
          let arrivalMs: number | null = null;
          if (start !== null) {
            const timed = scheduleRide(
              pattern,
              ride,
              label.arrivalMs,
              horizon,
              round ? MIN_TRANSFER_SECONDS : 0,
              options.allowScheduled !== false
            );
            if (!timed) continue;
            ride = timed.ride;
            arrivalMs = timed.arrivalMs;
          }
          const legs = [...label.legs, ride];
          const riding = label.riding + ride.distanceMeters;
          const stopId = ride.alight.id;
          const lastWalk = egress.get(stopId);
          if (lastWalk) {
            const complete = [
              ...legs,
              ...(lastWalk.distanceMeters ? [lastWalk] : []),
            ];
            const rides = complete.filter(
              (l): l is RideLeg => l.kind === 'ride'
            );
            results.push({
              id: createHash('sha256')
                .update(
                  JSON.stringify(
                    rides.map((l) => [
                      l.patternId,
                      l.board.sequence,
                      l.alight.sequence,
                    ])
                  )
                )
                .digest('hex')
                .slice(0, 16),
              legs: complete,
              transfers: round,
              walkingMeters: label.walking + lastWalk.distanceMeters,
              ridingMeters: riding,
              durationSeconds:
                start !== null && arrivalMs !== null
                  ? (arrivalMs - start) / 1000 + lastWalk.durationSeconds
                  : null,
              timingStatus: arrivalMs === null ? 'unknown' : 'scheduled',
              arrivalAt:
                arrivalMs === null
                  ? null
                  : new Date(
                      arrivalMs + lastWalk.durationSeconds * 1000
                    ).toISOString(),
              fareRwf: rides.every((l) => l.fare !== null)
                ? rides.reduce((sum, l) => sum + l.fare!.amount, 0)
                : null,
            });
          }
          if (round < options.maxTransfers) {
            const usedRoutes = [...label.usedRoutes, pattern.routeId];
            retain({
              stopId,
              legs,
              walking: label.walking,
              riding,
              usedRoutes,
              arrivalMs,
            });
            for (const transfer of transfers.get(stopId) || [])
              retain({
                stopId: transfer.to.stopId!,
                legs: [...legs, transfer],
                walking: label.walking + transfer.distanceMeters,
                riding,
                usedRoutes,
                arrivalMs:
                  arrivalMs === null
                    ? null
                    : arrivalMs + transfer.durationSeconds * 1000,
              });
          }
        }
        if (expansions > maxExpansions) {
          searchLimitReached = true;
          break;
        }
      }
    const retainedFrontier = [...next.values()]
      .flat()
      .sort((a, b) => a.walking - b.walking || a.riding - b.riding);
    if (retainedFrontier.length > maxFrontier) searchLimitReached = true;
    frontier = retainedFrontier.slice(0, maxFrontier);
    if (expansions > maxExpansions) {
      searchLimitReached = true;
      break;
    }
  }
  const distinct = new Map<string, Journey>();
  for (const j of results.sort((a, b) =>
    compareJourneys(a, b, options.preference)
  )) {
    const key = j.legs
      .filter((l): l is RideLeg => l.kind === 'ride')
      .map((l) => `${l.routeId}:${l.stops.map((s) => s.id).join('>')}`)
      .join('|');
    if (!distinct.has(key)) distinct.set(key, j);
  }
  const transferRules =
    snapshot.fareRules?.filter(
      (r) => r.kind === 'transfer_discount' || r.kind === 'transfer_charge'
    ) ?? [];
  const enriched = [...distinct.values()]
    .slice(0, 3)
    .map((j) =>
      enrichJourney(
        j,
        snapshot.patterns,
        transferRules,
        start === null ? undefined : kigaliDate(new Date(start))
      )
    );
  return { journeys: enriched, searchLimitReached };
}
