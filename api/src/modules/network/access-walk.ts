import { distance } from './geo';
import type { ResolvedLocation, WalkLeg } from './network.types';

/** A boarding-point handoff, not a fabricated pedestrian route or transfer. */
export function unverifiedAccessWalk(
  from: ResolvedLocation,
  to: ResolvedLocation
): WalkLeg {
  const metres = Math.max(
    1,
    Math.round(distance(from.coordinates, to.coordinates))
  );
  return {
    kind: 'walk',
    from,
    to,
    distanceMeters: metres,
    durationSeconds: null,
    geometry: [],
    quality: 'unverified-access',
    instructions: [
      `Walk to ${to.name}.`,
      `This point is ${metres} m away in a straight line; the walking route may be longer.`,
      'Open walking navigation to check the streets, paths, and crossings before setting out.',
    ],
  };
}
