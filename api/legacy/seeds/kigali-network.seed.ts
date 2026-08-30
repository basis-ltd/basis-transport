import '../polyfills';
import 'reflect-metadata';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Point, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { Agency } from '../entities/agency.entity';
import { Corridor } from '../entities/corridor.entity';
import { Stop } from '../entities/networkStop.entity';
import { TransitRoute } from '../entities/transitRoute.entity';
import { RouteStop } from '../entities/routeStop.entity';
import { RouteFrequency } from '../entities/routeFrequency.entity';
import { Location } from '../entities/location.entity';
import { Trip } from '../entities/trip.entity';
import {
  ROUTE_TYPE_BUS,
  RouteServiceType,
  StopType,
} from '../constants/network.constants';
import { TripStatus } from '../constants/trip.constants';
import { UUID } from '../types';

/**
 * KIGALI NETWORK SEED
 *
 * Loads the offline, public-source network snapshot in
 * `api/data/kigali-network-seed.json` into the GTFS-shaped tables.
 *
 * Sources and licensing: see ATTRIBUTION.md at the repository root. Nothing here
 * touches Ecofleet's live API - the JSON is generated offline from the 2019
 * DT4A GTFS plus Ecofleet's published corridor map and airport timetable.
 *
 * The seed is idempotent: records are matched on their natural keys (agency
 * name, corridor code, stop code, route short_name + source) and updated in
 * place, and each route's stop sequence and headway windows are rewritten from
 * the file rather than appended to.
 */

const SEED_FILE = resolve(__dirname, '../../data/kigali-network-seed.json');

// Bus parks and terminals in the 2019 feed are only distinguishable by name.
// Anchored on the transport words so a "Park Inn" hotel stop is not a hub.
const HUB_NAME_PATTERN =
  /(bus|taxi|tax)\s*(park|station)|taxi\s*stop|park$|station$|terminal/i;

interface SeedAgency {
  name: string;
  timezone: string;
  source: string;
  asOf?: string;
}

interface SeedCorridor {
  code: string;
  name: string;
  fromHub: string;
  toHub: string;
  color?: string;
  route?: string;
  stops: string[];
  source: string;
}

interface SeedNamedStop {
  code: string;
  name: string;
  lat?: number;
  lng?: number;
  stopType: StopType;
  source: string;
}

interface SeedRouteStop {
  stopCode: string;
  stopName: string;
  sequence: number;
  lat?: number;
  lng?: number;
}

interface SeedFrequency {
  startTime: string;
  endTime: string;
  headwaySecs: number;
  service: RouteServiceType;
  source: string;
  notes?: string;
}

interface SeedRoute {
  shortName: string;
  longName?: string;
  description?: string;
  agency: string;
  routeType?: number;
  source: string;
  asOf?: string;
  stops: SeedRouteStop[];
  frequencies: SeedFrequency[];
}

interface SeedAirportShuttle {
  shortName: string;
  longName: string;
  description: string;
  agency: string;
  source: string;
  asOf?: string;
  fareNoteRwf?: number;
  officialUrl?: string;
  stops: Array<{
    stopName: string;
    lat?: number;
    lng?: number;
    sequence: number;
  }>;
  frequencies: SeedFrequency[];
}

interface SeedFile {
  meta: { attribution: string[] };
  agencies: SeedAgency[];
  corridors: SeedCorridor[];
  namedStops: SeedNamedStop[];
  historicRoutes: SeedRoute[];
  airportShuttle: SeedAirportShuttle;
  demoLocations: Array<{
    name: string;
    lat: number;
    lng: number;
    description?: string;
  }>;
  demoTrips: Array<{
    from: string;
    to?: string;
    status: TripStatus;
    totalCapacity?: number;
  }>;
}

/**
 * Stable, source-prefixed stop code so a 2019 GTFS id can never collide with a
 * future Ecofleet id for a different point.
 */
const gtfsStopCode = (code: string): string => `DT4A_${code}`;

const ecofleetStopCode = (name: string): string =>
  `ECO_${name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')}`.slice(0, 64);

const inferStopType = (name: string): StopType =>
  HUB_NAME_PATTERN.test(name) ? StopType.HUB : StopType.STOP;

const toPoint = (lat?: number, lng?: number): Point | undefined =>
  typeof lat === 'number' && typeof lng === 'number'
    ? { type: 'Point', coordinates: [lng, lat] }
    : undefined;

export async function seedKigaliNetwork(): Promise<void> {
  const seed = JSON.parse(readFileSync(SEED_FILE, 'utf-8')) as SeedFile;

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const agencyRepository = app.get<Repository<Agency>>(
      getRepositoryToken(Agency)
    );
    const corridorRepository = app.get<Repository<Corridor>>(
      getRepositoryToken(Corridor)
    );
    const stopRepository = app.get<Repository<Stop>>(getRepositoryToken(Stop));
    const routeRepository = app.get<Repository<TransitRoute>>(
      getRepositoryToken(TransitRoute)
    );
    const routeStopRepository = app.get<Repository<RouteStop>>(
      getRepositoryToken(RouteStop)
    );
    const routeFrequencyRepository = app.get<Repository<RouteFrequency>>(
      getRepositoryToken(RouteFrequency)
    );
    const locationRepository = app.get<Repository<Location>>(
      getRepositoryToken(Location)
    );
    const tripRepository = app.get<Repository<Trip>>(getRepositoryToken(Trip));

    /**
     * AGENCIES
     */
    const existingAgencies = await agencyRepository.find();
    const agencyByName = new Map(
      existingAgencies.map((agency) => [agency.name, agency])
    );

    await agencyRepository.save(
      seed.agencies.map((agency) => ({
        id: agencyByName.get(agency.name)?.id,
        name: agency.name,
        timezone: agency.timezone,
        source: agency.source,
        asOf: agency.asOf,
      }))
    );

    const agencies = await agencyRepository.find();
    const agencyIdByName = new Map<string, UUID>(
      agencies.map((agency) => [agency.name, agency.id])
    );

    /**
     * CORRIDORS
     */
    const existingCorridors = await corridorRepository.find();
    const corridorByCode = new Map(
      existingCorridors.map((corridor) => [corridor.code, corridor])
    );

    await corridorRepository.save(
      seed.corridors.map((corridor) => ({
        id: corridorByCode.get(corridor.code)?.id,
        code: corridor.code,
        name: corridor.route ? `${corridor.name} - ${corridor.route}` : corridor.name,
        fromHub: corridor.fromHub,
        toHub: corridor.toHub,
        color: corridor.color,
        stopNames: corridor.stops,
        source: corridor.source,
      }))
    );

    /**
     * STOPS
     *
     * Three inputs, deduplicated on the stop code: the named stops list, the
     * stops referenced by a route sequence (the feed references some codes that
     * are not in the named list), and the airport shuttle stops.
     */
    const stopsByCode = new Map<string, Partial<Stop>>();

    for (const stop of seed.namedStops) {
      stopsByCode.set(gtfsStopCode(stop.code), {
        code: gtfsStopCode(stop.code),
        name: stop.name,
        location: toPoint(stop.lat, stop.lng),
        stopType: stop.stopType,
        source: stop.source,
      });
    }

    for (const route of seed.historicRoutes) {
      for (const stop of route.stops) {
        const code = gtfsStopCode(stop.stopCode);
        if (stopsByCode.has(code)) continue;

        stopsByCode.set(code, {
          code,
          name: stop.stopName,
          location: toPoint(stop.lat, stop.lng),
          stopType: inferStopType(stop.stopName),
          source: route.source,
        });
      }
    }

    const shuttle = seed.airportShuttle;
    for (const stop of shuttle.stops) {
      const code = ecofleetStopCode(stop.stopName);
      const isTerminal =
        stop.sequence === 1 || stop.sequence === shuttle.stops.length;

      stopsByCode.set(code, {
        code,
        name: stop.stopName,
        location: toPoint(stop.lat, stop.lng),
        stopType: isTerminal ? StopType.HUB : inferStopType(stop.stopName),
        source: shuttle.source,
      });
    }

    const existingStops = await stopRepository.find({
      where: { code: In([...stopsByCode.keys()]) },
    });
    const existingStopIdByCode = new Map<string, UUID>(
      existingStops.map((stop) => [stop.code, stop.id])
    );

    await stopRepository.save(
      [...stopsByCode.values()].map((stop) => ({
        ...stop,
        id: existingStopIdByCode.get(String(stop.code)),
      })),
      { chunk: 200 }
    );

    const stops = await stopRepository.find({
      where: { code: In([...stopsByCode.keys()]) },
      select: { id: true, code: true },
    });
    const stopIdByCode = new Map<string, UUID>(
      stops.map((stop) => [stop.code, stop.id])
    );

    /**
     * ROUTES
     *
     * The 55 historic numbered lines plus the airport shuttle. Matched on
     * (short_name, source) so a future Ecofleet `104F` never overwrites the
     * historic `104`.
     */
    const seedRoutes: SeedRoute[] = [
      ...seed.historicRoutes,
      {
        shortName: shuttle.shortName,
        longName: shuttle.longName,
        description: shuttle.fareNoteRwf
          ? `${shuttle.description} Published fare ${shuttle.fareNoteRwf} RWF (${shuttle.officialUrl}).`
          : shuttle.description,
        agency: shuttle.agency,
        routeType: ROUTE_TYPE_BUS,
        source: shuttle.source,
        asOf: shuttle.asOf,
        stops: shuttle.stops.map((stop) => ({
          stopCode: ecofleetStopCode(stop.stopName),
          stopName: stop.stopName,
          sequence: stop.sequence,
          lat: stop.lat,
          lng: stop.lng,
        })),
        frequencies: shuttle.frequencies,
      },
    ];

    const existingRoutes = await routeRepository.find();
    const routeKey = (shortName: string, source: string) =>
      `${shortName}::${source}`;
    const existingRouteIdByKey = new Map<string, UUID>(
      existingRoutes.map((route) => [
        routeKey(route.shortName, route.source),
        route.id,
      ])
    );

    const missingAgencies = seedRoutes.filter(
      (route) => !agencyIdByName.has(route.agency)
    );
    if (missingAgencies.length > 0) {
      throw new Error(
        `Seed file references unknown agencies: ${[
          ...new Set(missingAgencies.map((route) => route.agency)),
        ].join(', ')}`
      );
    }

    await routeRepository.save(
      seedRoutes.map((route) => ({
        id: existingRouteIdByKey.get(routeKey(route.shortName, route.source)),
        agencyId: agencyIdByName.get(route.agency) as UUID,
        shortName: route.shortName,
        longName: route.longName,
        description: route.description,
        routeType: route.routeType ?? ROUTE_TYPE_BUS,
        source: route.source,
        asOf: route.asOf,
      })),
      { chunk: 100 }
    );

    const routes = await routeRepository.find({
      select: { id: true, shortName: true, source: true },
    });
    const routeIdByKey = new Map<string, UUID>(
      routes.map((route) => [routeKey(route.shortName, route.source), route.id])
    );

    /**
     * ROUTE STOPS AND FREQUENCIES
     *
     * Rewritten wholesale for the seeded routes so a re-run converges on the
     * file instead of stacking duplicates.
     */
    const seededRouteIds = seedRoutes
      .map((route) => routeIdByKey.get(routeKey(route.shortName, route.source)))
      .filter((id): id is UUID => Boolean(id));

    await routeStopRepository.delete({ routeId: In(seededRouteIds) });
    await routeFrequencyRepository.delete({ routeId: In(seededRouteIds) });

    const routeStops: Array<Partial<RouteStop>> = [];
    const routeFrequencies: Array<Partial<RouteFrequency>> = [];
    let skippedStops = 0;

    for (const route of seedRoutes) {
      const routeId = routeIdByKey.get(routeKey(route.shortName, route.source));
      if (!routeId) continue;

      const seenSequences = new Set<number>();

      for (const stop of route.stops) {
        const code =
          route.source === shuttle.source
            ? stop.stopCode
            : gtfsStopCode(stop.stopCode);
        const stopId = stopIdByCode.get(code);

        if (!stopId || seenSequences.has(stop.sequence)) {
          skippedStops += 1;
          continue;
        }

        seenSequences.add(stop.sequence);
        routeStops.push({ routeId, stopId, sequence: stop.sequence });
      }

      // The 2019 feed repeats identical headway windows once per trip.
      const seenFrequencies = new Set<string>();

      for (const frequency of route.frequencies ?? []) {
        const key = [
          frequency.startTime,
          frequency.endTime,
          frequency.headwaySecs,
          frequency.service,
        ].join('|');

        if (seenFrequencies.has(key)) continue;
        seenFrequencies.add(key);

        routeFrequencies.push({
          routeId,
          startTime: frequency.startTime,
          endTime: frequency.endTime,
          headwaySecs: frequency.headwaySecs,
          service: frequency.service,
          source: frequency.source,
          notes: frequency.notes,
        });
      }
    }

    await routeStopRepository.save(routeStops, { chunk: 300 });
    await routeFrequencyRepository.save(routeFrequencies, { chunk: 300 });

    /**
     * DEMO LOCATIONS AND TRIPS
     *
     * These stay in the existing operational tables - a Location is still an
     * ad-hoc origin/destination pin, not a network stop.
     */
    const existingLocations = await locationRepository.find();
    const locationByName = new Map(
      existingLocations.map((location) => [location.name, location])
    );

    await locationRepository.save(
      seed.demoLocations.map((location) => ({
        id: locationByName.get(location.name)?.id,
        name: location.name,
        description: location.description,
        address: toPoint(location.lat, location.lng),
      }))
    );

    const locations = await locationRepository.find();
    const locationIdByName = new Map<string, UUID>(
      locations.map((location) => [location.name, location.id])
    );

    let seededTrips = 0;

    for (const [index, demoTrip] of seed.demoTrips.entries()) {
      const locationFromId = locationIdByName.get(demoTrip.from);
      const locationToId = demoTrip.to
        ? locationIdByName.get(demoTrip.to)
        : undefined;

      if (!locationFromId) continue;

      const referenceId = `TRIP-KGL${String(index + 1).padStart(2, '0')}`;
      const existingTrip = await tripRepository.findOne({
        where: { referenceId },
      });

      const demoLocation = seed.demoLocations.find(
        (location) => location.name === demoTrip.from
      );

      await tripRepository.save({
        id: existingTrip?.id,
        referenceId,
        locationFromId,
        locationToId,
        status: demoTrip.status,
        totalCapacity: demoTrip.totalCapacity ?? 0,
        startTime: existingTrip?.startTime ?? new Date(),
        currentLocation:
          existingTrip?.currentLocation ??
          toPoint(demoLocation?.lat, demoLocation?.lng),
      });

      seededTrips += 1;
    }

    console.log(
      [
        `Seeded Kigali network from ${SEED_FILE}:`,
        `  agencies:          ${seed.agencies.length}`,
        `  corridors:         ${seed.corridors.length}`,
        `  stops:             ${stopsByCode.size}`,
        `  routes:            ${seedRoutes.length}`,
        `  route stops:       ${routeStops.length}${
          skippedStops ? ` (skipped ${skippedStops})` : ''
        }`,
        `  route frequencies: ${routeFrequencies.length}`,
        `  demo locations:    ${seed.demoLocations.length}`,
        `  demo trips:        ${seededTrips}`,
        'Attribution: see ATTRIBUTION.md.',
      ].join('\n')
    );
  } finally {
    await app.close();
  }
}

async function run(): Promise<void> {
  try {
    await seedKigaliNetwork();
    process.exitCode = 0;
  } catch (error) {
    console.error('Failed to seed the Kigali network:', error);
    process.exitCode = 1;
  }
}

void run();
