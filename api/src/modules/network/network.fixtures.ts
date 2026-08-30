import { randomUUID } from 'crypto';
import type { NetworkPattern, NetworkSnapshot, WalkLeg } from './network.types';

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
