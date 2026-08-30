import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import {
  NetworkDataset,
  PatternStopProjection,
  RoutePattern,
} from '../../entities/networkDataset.entity';
import { distance, normalizeName } from './geo';
import { searchJourneys } from './journey-engine';
import { NetworkQueryDto, PlanJourneyDto } from './network.dto';
import { validateSnapshot } from './network.validation';
import { WalkingProviderUnavailable, WalkingService } from './walking.service';
import type {
  JourneyLocation,
  JourneyPlan,
  NetworkSnapshot,
  NetworkStop,
  ResolvedLocation,
  WalkLeg,
} from './network.types';

export const internalNetwork = () =>
  process.env.NETWORK_ACCESS === 'internal' &&
  process.env.NODE_ENV !== 'production';
const today = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Kigali' }).format(
    new Date()
  );

@Injectable()
export class NetworkService {
  private cached: NetworkDataset | null = null;
  private readonly durations: number[] = [];
  private readonly outcomes: Record<string, number> = {};
  metrics() {
    const sorted = [...this.durations].sort((a, b) => a - b);
    return {
      scope: 'this-worker',
      samples: sorted.length,
      outcomes: { ...this.outcomes },
      walking: this.walking.metrics(),
      p95Ms: sorted.length
        ? Math.round(sorted[Math.ceil(sorted.length * 0.95) - 1])
        : null,
    };
  }
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly walking: WalkingService
  ) {}
  private get repo() {
    return this.db.getRepository(NetworkDataset);
  }

  async dataset(): Promise<NetworkDataset> {
    // Check the published identity on every request so clustered workers cannot serve a stale graph.
    const identity = await this.repo.findOne({
      where: { status: 'published' },
      select: { id: true },
    });
    if (!identity)
      throw new ServiceUnavailableException(
        'No network has been published yet.'
      );
    const dataset =
      this.cached?.id === identity.id
        ? this.cached
        : await this.repo.findOneByOrFail({ id: identity.id });
    if (
      !internalNetwork() &&
      (dataset.rightsStatus !== 'approved' ||
        dataset.verification !== 'verified' ||
        !dataset.validFrom ||
        dataset.validFrom > today() ||
        !dataset.validTo ||
        dataset.validTo < today())
    ) {
      throw new ServiceUnavailableException(
        'Current, verified coverage is not available yet. This dataset is restricted to internal testing.'
      );
    }
    this.cached = dataset;
    return dataset;
  }
  metadata(d: NetworkDataset) {
    return {
      version: d.version,
      source: d.source,
      sourceUrl: d.sourceUrl,
      verification: d.verification,
      rightsStatus: d.rightsStatus,
      validFrom: d.validFrom,
      validTo: d.validTo,
      importedAt: d.importedAt,
      publishedAt: d.publishedAt,
    };
  }
  async status() {
    try {
      const d = await this.dataset();
      return {
        ready: true,
        mode: internalNetwork() ? 'internal-beta' : 'verified',
        ...this.metadata(d),
        routes: new Set(
          d.snapshot.patterns.filter((p) => p.enabled).map((p) => p.routeId)
        ).size,
        stops: this.stops(d.snapshot).length,
        patterns: d.snapshot.patterns.filter((p) => p.enabled).length,
        walkingAvailable: this.walking.health() === 'configured',
        walkingStatus: this.walking.health(),
        notice:
          d.verification === 'historic'
            ? 'Historic 2019 network · internal testing only. Routes and operating information may have changed.'
            : 'Network directions, not live bus arrivals.',
      };
    } catch {
      return {
        ready: false,
        mode: 'unavailable',
        routes: 0,
        stops: 0,
        patterns: 0,
        walkingAvailable: Boolean(process.env.GOOGLE_ROUTES_API_KEY),
        notice: 'Verified network coverage is not available yet.',
      };
    }
  }
  stops(snapshot: NetworkSnapshot): NetworkStop[] {
    return [
      ...new Map(
        snapshot.patterns
          .filter((p) => p.enabled)
          .flatMap((p) =>
            p.stops.map(
              (s) =>
                [
                  s.id,
                  {
                    id: s.id,
                    code: s.code,
                    name: s.name,
                    coordinates: s.coordinates,
                    aliases: s.aliases,
                  },
                ] as const
            )
          )
      ).values(),
    ];
  }
  private page<T>(rows: T[], query: NetworkQueryDto) {
    return {
      rows: rows.slice(query.page * query.size, (query.page + 1) * query.size),
      totalCount: rows.length,
      totalPages: Math.ceil(rows.length / query.size),
      currentPage: query.page + 1,
    };
  }
  async listStops(query: NetworkQueryDto) {
    const d = await this.dataset();
    if ((query.lat === undefined) !== (query.lng === undefined))
      throw new BadRequestException('Provide both latitude and longitude.');
    const q = normalizeName(query.q || '');
    let stops = this.stops(d.snapshot).filter(
      (s) =>
        !q ||
        [s.name, s.code, ...s.aliases].some((n) => normalizeName(n).includes(q))
    ) as (NetworkStop & { distanceMeters?: number })[];
    if (query.lat !== undefined && query.lng !== undefined) {
      const distances = (await this.db.query(
        `SELECT stop_id, MIN(ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($2,$3),4326)::geography)) AS metres
        FROM pattern_stops WHERE dataset_id=$1 AND ST_DWithin(location::geography,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,$4) GROUP BY stop_id`,
        [d.id, query.lng, query.lat, query.radius]
      )) as { stop_id: string; metres: number }[];
      const byId = new Map(distances.map((s) => [s.stop_id, +s.metres]));
      stops = stops
        .filter((s) => byId.has(s.id))
        .map((s) => ({ ...s, distanceMeters: Math.round(byId.get(s.id)!) }))
        .sort(
          (a, b) =>
            a.distanceMeters - b.distanceMeters || a.name.localeCompare(b.name)
        );
    } else stops.sort((a, b) => a.name.localeCompare(b.name));
    const page = this.page(stops, query);
    return {
      ...page,
      rows: page.rows.map((s) => ({
        ...s,
        routeNumbers: [
          ...new Set(
            d.snapshot.patterns
              .filter(
                (p) =>
                  p.enabled &&
                  p.stops.some((occurrence) => occurrence.id === s.id)
              )
              .map((p) => p.routeNumber)
          ),
        ],
      })),
      network: this.metadata(d),
    };
  }
  async stop(id: string) {
    const d = await this.dataset();
    const stop = this.stops(d.snapshot).find(
      (s) => s.id === id || s.code === id
    );
    if (!stop)
      throw new NotFoundException('Stop not found in the published network.');
    const routes = this.routes(d.snapshot).filter((r) =>
      d.snapshot.patterns.some(
        (p) =>
          p.enabled &&
          p.routeId === r.id &&
          p.stops.some((s) => s.id === stop.id)
      )
    );
    return { ...stop, routes, network: this.metadata(d) };
  }
  routes(snapshot: NetworkSnapshot) {
    return [
      ...new Map(
        snapshot.patterns
          .filter((p) => p.enabled)
          .map((p) => [
            p.routeId,
            {
              id: p.routeId,
              shortName: p.routeNumber,
              longName: p.routeName,
              agency: p.agency,
              patterns: snapshot.patterns.filter(
                (v) => v.enabled && v.routeId === p.routeId
              ).length,
            },
          ])
      ).values(),
    ].sort((a, b) =>
      a.shortName.localeCompare(b.shortName, undefined, { numeric: true })
    );
  }
  async listRoutes(query: NetworkQueryDto) {
    const d = await this.dataset(),
      q = normalizeName(query.q || '');
    const routes = this.routes(d.snapshot).filter(
      (r) =>
        !q ||
        normalizeName(`${r.shortName} ${r.longName} ${r.agency}`).includes(q)
    );
    return { ...this.page(routes, query), network: this.metadata(d) };
  }
  async route(id: string) {
    const d = await this.dataset();
    const matches = this.routes(d.snapshot).filter(
      (r) => r.id === id || r.shortName === id
    );
    if (matches.length !== 1)
      throw new NotFoundException(
        'Route not found or ambiguous; use its source-qualified ID.'
      );
    return {
      ...matches[0],
      patterns: d.snapshot.patterns.filter(
        (p) => p.enabled && p.routeId === matches[0].id
      ),
      network: this.metadata(d),
    };
  }
  private resolve(
    location: JourneyLocation | undefined,
    stops: NetworkStop[]
  ): ResolvedLocation {
    if (!location)
      throw new BadRequestException('Select an origin and destination.');
    if (location.stopId) {
      const stop = stops.find((s) => s.id === location.stopId);
      if (!stop)
        throw new BadRequestException(
          'A selected stop is no longer in the network. Select it again.'
        );
      return {
        stopId: stop.id,
        name: stop.name,
        coordinates: stop.coordinates,
      };
    }
    if (location.latitude === undefined || location.longitude === undefined)
      throw new BadRequestException(
        'Select a stop or provide both coordinates.'
      );
    return {
      name: 'Selected location',
      coordinates: [location.longitude, location.latitude],
    };
  }
  async plan(input: PlanJourneyDto): Promise<JourneyPlan> {
    const started = performance.now();
    try {
      const result = await this.calculatePlan(input);
      this.outcomes[result.status] = (this.outcomes[result.status] || 0) + 1;
      return result;
    } catch (error) {
      this.outcomes.error = (this.outcomes.error || 0) + 1;
      throw error;
    } finally {
      this.durations.push(performance.now() - started);
      if (this.durations.length > 1000) this.durations.shift();
    }
  }
  private async calculatePlan(input: PlanJourneyDto): Promise<JourneyPlan> {
    const d = await this.dataset(),
      stops = this.stops(d.snapshot);
    const origin = this.resolve(input.origin, stops),
      destination = this.resolve(input.destination, stops);
    if (distance(origin.coordinates, destination.coordinates) < 1)
      throw new BadRequestException(
        'Origin and destination must be different.'
      );
    const warnings = [
      'Bus waiting time is unknown. Journey times and fares are not guaranteed.',
      'Walking directions can be incomplete. Check crossings and local conditions.',
    ];
    if (d.verification !== 'verified')
      warnings.unshift(
        'Historic network for internal testing; confirm stops and service locally before travelling.'
      );
    const result: JourneyPlan = {
      status: 'no_connection',
      validFrom: d.validFrom,
      validTo: d.validTo,
      datasetVersion: d.version,
      verification: d.verification,
      sourceUrl: d.sourceUrl,
      origin,
      destination,
      journeys: [],
      warnings,
    };
    let failed = false;
    const candidates = async (
      location: ResolvedLocation,
      reversed: boolean
    ) => {
      const found = location.stopId
        ? [{ stop_id: location.stopId }]
        : ((await this.db.query(
            `SELECT stop_id, MIN(ST_Distance(location::geography,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography)) AS distance
        FROM pattern_stops WHERE dataset_id=$1 AND ST_DWithin(location::geography,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,$4)
        GROUP BY stop_id ORDER BY distance,stop_id LIMIT 8`,
            [d.id, ...location.coordinates, input.maxWalkMeters]
          )) as { stop_id: string }[]);
      const legs = new Map<string, WalkLeg>();
      await Promise.all(
        found.map(async (candidate) => {
          const stop = stops.find((s) => s.id === candidate.stop_id);
          if (!stop) return;
          const stopLocation: ResolvedLocation = {
            stopId: stop.id,
            name: stop.name,
            coordinates: stop.coordinates,
          };
          try {
            const leg = await this.walking.route(
              reversed ? stopLocation : location,
              reversed ? location : stopLocation
            );
            if (leg && leg.distanceMeters <= input.maxWalkMeters)
              legs.set(stop.id, leg);
          } catch (e) {
            if (e instanceof WalkingProviderUnavailable) failed = true;
            else throw e;
          }
        })
      );
      return { found, legs };
    };
    const [access, egress] = await Promise.all([
      candidates(origin, false),
      candidates(destination, true),
    ]);
    if (!access.found.length || !egress.found.length)
      return { ...result, status: 'outside_coverage' };
    result.journeys = searchJourneys(
      d.snapshot,
      access.legs,
      egress.legs,
      input
    );
    result.status = result.journeys.length
      ? 'ok'
      : failed
        ? 'provider_unavailable'
        : 'no_connection';
    if (failed)
      result.warnings.push(
        'Some walking connections could not be checked. Select a bus stop directly or try again.'
      );
    return result;
  }

  async project(manager: EntityManager, d: NetworkDataset) {
    await manager.delete(RoutePattern, { datasetId: d.id });
    for (const p of d.snapshot.patterns.filter((p) => p.enabled)) {
      await manager.insert(RoutePattern, {
        id: p.id,
        datasetId: d.id,
        sourceTripId: p.sourceTripId,
        routeId: p.routeId,
        direction: p.direction,
      });
      await manager.insert(
        PatternStopProjection,
        p.stops.map((s) => ({
          datasetId: d.id,
          patternId: p.id,
          stopId: s.id,
          sequence: s.sequence,
          location: { type: 'Point' as const, coordinates: s.coordinates },
        }))
      );
    }
  }
  async createDraft(values: Partial<NetworkDataset>) {
    const issues = validateSnapshot(values.snapshot);
    if (issues.length)
      throw new BadRequestException({
        message: 'Network validation failed',
        data: issues,
      });
    return this.db.transaction(async (manager) => {
      const draft = await manager.save(
        NetworkDataset,
        manager.create(NetworkDataset, {
          ...values,
          status: 'draft',
          publishedAt: null,
        })
      );
      await this.project(manager, draft);
      return draft;
    });
  }
  async draft(id: string) {
    const d = await this.repo.findOneBy({ id });
    if (!d) throw new NotFoundException('Dataset not found');
    return d;
  }
  async listDatasets() {
    const rows = await this.repo.find({ order: { importedAt: 'DESC' } });
    return rows.map(({ snapshot, ...d }) => ({
      ...d,
      patternCount: snapshot.patterns.length,
    }));
  }
  async clone(id: string) {
    const d = await this.draft(id);
    const snapshot: NetworkSnapshot = JSON.parse(JSON.stringify(d.snapshot));
    snapshot.patterns.forEach((p) => (p.id = randomUUID()));
    return this.createDraft({
      source: d.source,
      sourceUrl: d.sourceUrl,
      checksum: d.checksum,
      version: `${d.version}-edit-${Date.now()}`,
      snapshot,
      issues: d.issues,
      verification: d.verification,
      rightsStatus: d.rightsStatus,
      rightsEvidence: d.rightsEvidence,
      verificationEvidence: d.verificationEvidence,
      validFrom: d.validFrom,
      validTo: d.validTo,
    });
  }
  async edit(id: string, snapshot: NetworkSnapshot) {
    const issues = validateSnapshot(snapshot);
    if (issues.length)
      throw new BadRequestException({
        message: 'Network validation failed',
        data: issues,
      });
    return this.db.transaction(async (manager) => {
      const d = await manager.findOne(NetworkDataset, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!d || d.status !== 'draft')
        throw new ConflictException(
          'Only drafts can be changed. Clone a published version first.'
        );
      d.snapshot = snapshot;
      d.validFrom = snapshot.patterns.map((p) => p.service.validFrom).sort()[0];
      d.validTo = snapshot.patterns.map((p) => p.service.validTo).sort()[0];
      await manager.save(d);
      await this.project(manager, d);
      return d;
    });
  }
  async metadataUpdate(id: string, changes: Partial<NetworkDataset>) {
    const d = await this.draft(id);
    if (d.status !== 'draft')
      throw new ConflictException('Only draft metadata can be changed.');
    if (d.source === 'dt4a-2019' && changes.verification === 'verified')
      throw new BadRequestException(
        'A historic feed cannot be relabeled as current. Import a reviewed current source.'
      );
    await this.repo.update({ id, status: 'draft' }, changes);
    return this.draft(id);
  }
  async publish(id: string) {
    return this.db.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(1788000001)');
      const d = await manager.findOne(NetworkDataset, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!d) throw new NotFoundException('Dataset not found');
      if (validateSnapshot(d.snapshot).length)
        throw new BadRequestException(
          'Resolve validation errors before publication.'
        );
      if (
        !internalNetwork() &&
        (d.rightsStatus !== 'approved' ||
          !d.rightsEvidence.trim() ||
          d.verification !== 'verified' ||
          !d.verificationEvidence.trim() ||
          d.snapshot.patterns.some(
            (p) =>
              p.enabled &&
              (p.service.validTo < today() || p.service.validFrom > today())
          ))
      )
        throw new BadRequestException(
          'Public publication requires current verified service, usage rights, and supporting evidence.'
        );
      await manager.update(
        NetworkDataset,
        { status: 'published' },
        { status: 'archived' }
      );
      d.status = 'published';
      d.publishedAt = new Date();
      await manager.save(d);
      this.cached = null;
      return this.metadata(d);
    });
  }
}
