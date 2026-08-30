import { Injectable } from '@nestjs/common';
import type { Coordinates, ResolvedLocation, WalkLeg } from './network.types';
import { distance } from './geo';

export class WalkingProviderUnavailable extends Error {}
@Injectable()
export class WalkingService {
  private active = 0;
  private windowStart = Date.now();
  private windowCalls = 0;
  private calls = 0;
  private failures = 0;
  private lastFailure = 0;
  private lastSuccess = 0;
  metrics() {
    return {
      calls: this.calls,
      failures: this.failures,
      inFlight: this.active,
    };
  }
  health() {
    return !process.env.GOOGLE_ROUTES_API_KEY
      ? 'unconfigured'
      : this.lastFailure > this.lastSuccess &&
          Date.now() - this.lastFailure < 60000
        ? 'degraded'
        : 'configured';
  }
  async route(
    from: ResolvedLocation,
    to: ResolvedLocation
  ): Promise<WalkLeg | null> {
    if (distance(from.coordinates, to.coordinates) < 1)
      return {
        kind: 'walk',
        from,
        to,
        distanceMeters: 0,
        durationSeconds: 0,
        geometry: [from.coordinates, to.coordinates],
        instructions: [],
        quality: 'pedestrian-route',
      };
    const key = process.env.GOOGLE_ROUTES_API_KEY;
    if (Date.now() - this.windowStart >= 60000) {
      this.windowStart = Date.now();
      this.windowCalls = 0;
    }
    const limit = Math.max(
      1,
      Math.min(
        1000,
        Number(process.env.GOOGLE_ROUTES_REQUESTS_PER_MINUTE) || 160
      )
    );
    if (this.windowCalls >= limit)
      throw new WalkingProviderUnavailable(
        'Walking quota temporarily exhausted'
      );
    if (!key || this.active >= 32)
      throw new WalkingProviderUnavailable(
        'Walking directions temporarily unavailable'
      );
    this.windowCalls++;
    this.calls++;
    this.active++;
    try {
      const point = (p: Coordinates) => ({
        location: { latLng: { latitude: p[1], longitude: p[0] } },
      });
      const response = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method: 'POST',
          signal: AbortSignal.timeout(3500),
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask':
              'routes.distanceMeters,routes.duration,routes.polyline.geoJsonLinestring,routes.legs.steps.navigationInstruction.instructions',
          },
          body: JSON.stringify({
            origin: point(from.coordinates),
            destination: point(to.coordinates),
            travelMode: 'WALK',
            polylineEncoding: 'GEO_JSON_LINESTRING',
            languageCode: 'en',
          }),
        }
      );
      if (!response.ok) throw new WalkingProviderUnavailable();
      const body = (await response.json()) as {
        routes?: {
          distanceMeters: number;
          duration: string;
          polyline?: { geoJsonLinestring?: { coordinates: Coordinates[] } };
          legs?: {
            steps?: { navigationInstruction?: { instructions?: string } }[];
          }[];
        }[];
      };
      const route = body.routes?.[0];
      this.lastSuccess = Date.now();
      if (!route) return null;
      const durationSeconds = Math.round(parseFloat(route.duration));
      if (
        !Number.isFinite(route.distanceMeters) ||
        !Number.isFinite(durationSeconds)
      )
        throw new WalkingProviderUnavailable();
      return {
        kind: 'walk',
        from,
        to,
        distanceMeters: route.distanceMeters,
        durationSeconds,
        geometry: route.polyline?.geoJsonLinestring?.coordinates || [],
        instructions:
          route.legs?.flatMap(
            (l) =>
              l.steps
                ?.map((s) => s.navigationInstruction?.instructions || '')
                .filter(Boolean) || []
          ) || [],
        quality: 'pedestrian-route',
      };
    } catch (error) {
      this.failures++;
      this.lastFailure = Date.now();
      if (error instanceof WalkingProviderUnavailable) throw error;
      throw new WalkingProviderUnavailable(); // Never propagate a provider request containing location/key data.
    } finally {
      this.active--;
    }
  }
}
