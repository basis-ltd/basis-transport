import { createHash } from 'crypto';
import { lineDistance } from './geo';
import type {
  Journey,
  NetworkPattern,
  NetworkSnapshot,
  RideLeg,
  WalkLeg,
} from './network.types';

export interface SearchOptions {
  maxTransfers: number;
  preference: 'fewest_transfers' | 'least_walking';
}
interface Label {
  stopId: string;
  legs: (WalkLeg | RideLeg)[];
  walking: number;
  riding: number;
  usedRoutes: string[];
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
  for (const t of snapshot.transfers.filter(
    (t) => t.reviewed && t.distanceMeters <= 400
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
        distanceMeters: t.distanceMeters,
        durationSeconds: t.durationSeconds,
        geometry: t.geometry,
        quality: 'reviewed-transfer',
        instructions: [`Walk to ${to.name} to change buses.`],
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
): Journey[] {
  const { boardings, transfers } = graphFor(snapshot);
  let frontier: Label[] = [...access].map(([stopId, leg]) => ({
    stopId,
    legs: leg.distanceMeters ? [leg] : [],
    walking: leg.distanceMeters,
    riding: 0,
    usedRoutes: [],
  }));
  const results: Journey[] = [];
  let expansions = 0;
  for (
    let round = 0;
    round <= options.maxTransfers && frontier.length;
    round++
  ) {
    const next = new Map<string, Label[]>();
    const retain = (label: Label) => {
      const key = `${label.stopId}|${label.usedRoutes.slice().sort().join(',')}`;
      const previous = next.get(key) || [];
      if (
        previous.some(
          (p) => p.walking <= label.walking && p.riding <= label.riding
        )
      )
        return;
      next.set(
        key,
        [
          ...previous.filter(
            (p) => !(label.walking <= p.walking && label.riding <= p.riding)
          ),
          label,
        ]
          .sort((a, b) => a.walking - b.walking || a.riding - b.riding)
          .slice(0, 4)
      );
    };
    for (const label of frontier)
      for (const { pattern, index } of boardings.get(label.stopId) || []) {
        if (label.usedRoutes.includes(pattern.routeId)) continue;
        for (let end = index + 1; end < pattern.stops.length; end++) {
          if (++expansions > 150000) break;
          const ride = rideLeg(pattern, index, end);
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
              // No waiting-time observations: a complete door-to-door duration is unknown.
              durationSeconds: null,
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
            });
            for (const transfer of transfers.get(stopId) || [])
              retain({
                stopId: transfer.to.stopId!,
                legs: [...legs, transfer],
                walking: label.walking + transfer.distanceMeters,
                riding,
                usedRoutes,
              });
          }
        }
        if (expansions > 150000) break;
      }
    frontier = [...next.values()]
      .flat()
      .sort((a, b) => a.walking - b.walking || a.riding - b.riding)
      .slice(0, 2000);
    if (expansions > 150000) break;
  }
  const distinct = new Map<string, Journey>();
  for (const j of results.sort((a, b) =>
    compareJourneys(a, b, options.preference)
  )) {
    const key = j.legs
      .filter((l): l is RideLeg => l.kind === 'ride')
      .map((l) => l.routeId)
      .join('|');
    if (!distinct.has(key)) distinct.set(key, j);
  }
  return [...distinct.values()].slice(0, 3);
}
