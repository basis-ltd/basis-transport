import { distance } from './geo';
import { stopAreas } from './stop-areas';
import type {
  NetworkSnapshot,
  NetworkStop,
  NearbyStopConnection,
  ResolvedLocation,
} from './network.types';

/** Suggestions retain exact platform IDs; a matching name never joins services. */
export function describeSearchStops<T extends NetworkStop>(
  snapshot: NetworkSnapshot,
  stops: T[],
  endpoint?: 'origin' | 'destination',
  otherStopId?: string
) {
  const areas = new Map(
    stopAreas(snapshot).map((a) => [a.id, a.boardingPointIds])
  );
  const otherIds = new Set(
    otherStopId ? (areas.get(otherStopId) ?? [otherStopId]) : []
  );
  const services = new Map<
    string,
    Map<string, { routeNumber: string; headsign: string }>
  >();
  const direct = new Set<string>();
  for (const pattern of snapshot.patterns) {
    if (!pattern.enabled) continue;
    const otherIndices = pattern.stops.flatMap((s, i) =>
      otherIds.has(s.id) ? [i] : []
    );
    pattern.stops.forEach((s, i) => {
      if (endpoint === 'origin' && i === pattern.stops.length - 1) return;
      if (endpoint === 'destination' && i === 0) return;
      const served = services.get(s.id) ?? new Map();
      served.set(`${pattern.routeId}:${pattern.headsign}`, {
        routeNumber: pattern.routeNumber,
        headsign: pattern.headsign,
      });
      services.set(s.id, served);
      if (
        endpoint &&
        otherIndices.some((j) => (endpoint === 'origin' ? i < j : j < i))
      )
        direct.add(s.id);
    });
  }
  return stops.flatMap((stop) => {
    const ids = areas.get(stop.id) ?? [stop.id];
    const serving = [
      ...new Map(ids.flatMap((id) => [...(services.get(id) ?? [])])).values(),
    ];
    if (endpoint && !serving.length) return [];
    return [
      {
        ...stop,
        services: serving,
        directConnection: ids.some((id) => direct.has(id)),
      },
    ];
  });
}

/** Recovery choices, NOT journeys from the requested endpoints or walking links.
 * One scan per pattern, with at most one closest preceding boarding occurrence.
 * Selecting a choice must explicitly start a new search between these stops.
 */
export function nearbyStopConnections(
  snapshot: NetworkSnapshot,
  origin: ResolvedLocation,
  destination: ResolvedLocation,
  radius: number
): NearbyStopConnection[] {
  const choices = new Map<string, NearbyStopConnection>();
  for (const pattern of snapshot.patterns) {
    if (!pattern.enabled) continue;
    let board: NetworkStop | undefined;
    let originOffset = Infinity;
    for (const stop of pattern.stops) {
      const destinationOffset = distance(
        destination.coordinates,
        stop.coordinates
      );
      if (
        board &&
        board.id !== stop.id &&
        distance(board.coordinates, stop.coordinates) >= 1 &&
        destinationOffset <= radius &&
        !(board.id === origin.stopId && stop.id === destination.stopId)
      ) {
        const choice: NearbyStopConnection = {
          origin: {
            stopId: board.id,
            name: board.name,
            coordinates: board.coordinates,
          },
          destination: {
            stopId: stop.id,
            name: stop.name,
            coordinates: stop.coordinates,
          },
          originDistanceMeters: Math.round(originOffset),
          destinationDistanceMeters: Math.round(destinationOffset),
          routeNumber: pattern.routeNumber,
          headsign: pattern.headsign,
        };
        const key = `${board.id}:${stop.id}`;
        if (!choices.has(key)) choices.set(key, choice);
      }
      const offset = distance(origin.coordinates, stop.coordinates);
      if (offset <= radius && offset < originOffset) {
        board = stop;
        originOffset = offset;
      }
    }
  }
  return [...choices.values()]
    .sort(
      (a, b) =>
        a.originDistanceMeters +
          a.destinationDistanceMeters -
          b.originDistanceMeters -
          b.destinationDistanceMeters ||
        a.routeNumber.localeCompare(b.routeNumber) ||
        a.origin.stopId!.localeCompare(b.origin.stopId!)
    )
    .slice(0, 3);
}
