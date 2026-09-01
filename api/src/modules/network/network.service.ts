import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import {
  NetworkDataset,
  PatternStopProjection,
  RoutePattern,
} from '../../entities/networkDataset.entity';
import { distance, normalizeName } from './geo';
import { compareSnapshots } from './network-comparison';
import { projectNetworkMap, NetworkMapQuery } from './network-map';
import { searchJourneys } from './journey-engine';
import { describeSearchStops, nearbyStopConnections } from './stop-search';
import {
  boardingPointsForArea,
  dedupeCandidateStops,
  expandStopSelection,
  stopAreas,
  terminalSearchResults,
  selectBoardingCandidates,
  prioritizeDirectCandidates,
} from './stop-areas';
import {
  filterRouteSummaries,
  routeAgencies,
  routeHeadsigns,
} from './route-filters';
import { enrichJourney } from './passenger-steps';
import { NetworkQueryDto, PlanJourneyDto } from './network.dto';
import { validateSnapshot } from './network.validation';
import {
  transferContentHash,
  transferPathIssues,
  snapshotRevision,
} from './transfer-review';
import { WalkingProviderUnavailable, WalkingService } from './walking.service';
import { unverifiedAccessWalk } from './access-walk';
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
  async map(query: NetworkMapQuery) {
    const d = await this.dataset();
    return {
      ...projectNetworkMap(d.snapshot, query),
      network: this.metadata(d),
    };
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
                    stopAreaId: s.stopAreaId,
                    displayNames: s.displayNames,
                    platformCode: s.platformCode,
                    sourceRecord: s.sourceRecord,
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
        [
          s.name,
          s.code,
          s.platformCode || '',
          ...s.aliases,
          ...Object.values(s.displayNames ?? {}),
        ].some((n) => normalizeName(n).includes(q))
    ) as (NetworkStop & { distanceMeters?: number })[];
    if (q) {
      const terminals = terminalSearchResults(
        d.snapshot,
        query.q || '',
        normalizeName
      );
      const seen = new Set(stops.map((s) => s.id));
      for (const terminal of terminals) {
        if (!seen.has(terminal.id)) stops.unshift(terminal);
      }
    }
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
    const described = describeSearchStops(
      d.snapshot,
      stops,
      query.endpoint,
      query.otherStopId
    );
    // Prioritize a same-pattern directional connection before pagination, while
    // retaining other stops (they may have a valid transfer journey).
    if (query.endpoint && query.otherStopId)
      described.sort(
        (a, b) => Number(b.directConnection) - Number(a.directConnection)
      );
    const page = this.page(described, query);
    return {
      ...page,
      rows: page.rows.map((s) => {
        const area = stopAreas(d.snapshot).find((a) => a.id === s.id);
        const routeNumbers = area
          ? [
              ...new Set(
                d.snapshot.patterns
                  .filter(
                    (p) =>
                      p.enabled &&
                      p.stops.some((occurrence) =>
                        area.boardingPointIds.includes(occurrence.id)
                      )
                  )
                  .map((p) => p.routeNumber)
              ),
            ]
          : [
              ...new Set(
                d.snapshot.patterns
                  .filter(
                    (p) =>
                      p.enabled &&
                      p.stops.some((occurrence) => occurrence.id === s.id)
                  )
                  .map((p) => p.routeNumber)
              ),
            ];
        return {
          ...s,
          routeNumbers,
          ...(area
            ? {
                terminalArea: true,
                boardingPointCount: area.boardingPointIds.length,
              }
            : {}),
        };
      }),
      network: this.metadata(d),
    };
  }
  async stop(id: string) {
    const d = await this.dataset();
    const stops = this.stops(d.snapshot);
    const terminal = stopAreas(d.snapshot).find((a) => a.id === id);
    const matches = stops.filter((s) => s.code === id);
    const exact = stops.find((s) => s.id === id);
    if (!exact && !terminal && matches.length > 1)
      throw new BadRequestException(
        'This stop code is shared by multiple platforms. Select the exact stop ID.'
      );
    const stop =
      exact || (terminal ? { ...terminal, code: terminal.id } : matches[0]);
    if (!stop)
      throw new NotFoundException('Stop not found in the published network.');
    const servingIds = terminal?.boardingPointIds ?? [stop.id];
    const routes = this.routes(d.snapshot).filter((r) =>
      d.snapshot.patterns.some(
        (p) =>
          p.enabled &&
          p.routeId === r.id &&
          p.stops.some((s) => servingIds.includes(s.id))
      )
    );
    const area =
      terminal ||
      ('stopAreaId' in stop && stop.stopAreaId
        ? stopAreas(d.snapshot).find((a) => a.id === stop.stopAreaId)
        : stopAreas(d.snapshot).find((a) =>
            a.boardingPointIds.includes(stop.id)
          ));
    const boardingPoints = area
      ? boardingPointsForArea(d.snapshot, area.id, this.stops(d.snapshot))
      : [];
    return {
      ...stop,
      routes,
      stopArea: area
        ? {
            id: area.id,
            name: area.name,
            boardingPoints: boardingPoints.map((p) => ({
              id: p.id,
              name: p.name,
              code: p.code,
            })),
          }
        : null,
      network: this.metadata(d),
    };
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
    const d = await this.dataset();
    const routes = filterRouteSummaries(this.routes(d.snapshot), d.snapshot, {
      q: query.q,
      agency: query.agency,
      headsign: query.headsign,
    });
    return {
      ...this.page(routes, query),
      network: this.metadata(d),
      filters: {
        agencies: routeAgencies(this.routes(d.snapshot)),
        headsigns: routeHeadsigns(d.snapshot),
      },
    };
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
  private async calculatePlan(
    input: PlanJourneyDto,
    automaticRadius = 800,
    walkingChecks = new Map<string, Promise<WalkLeg | null>>(),
    candidateLimit = 16
  ): Promise<JourneyPlan> {
    const maxWalkMeters = input.maxWalkMeters ?? automaticRadius;
    // Deduplicate retries as the radius expands; discard all data after this plan.
    const walk = (from: ResolvedLocation, to: ResolvedLocation) => {
      const key = JSON.stringify([from, to]);
      let checked = walkingChecks.get(key);
      if (!checked) {
        checked = this.walking.route(from, to);
        walkingChecks.set(key, checked);
      }
      return checked;
    };
    const d = await this.dataset(),
      stops = this.stops(d.snapshot);
    const selectable = [
      ...stops,
      ...(d.snapshot.stopAreas || []).map((a) => ({
        ...a,
        code: a.id,
      })),
    ];
    const origin = this.resolve(input.origin, selectable),
      destination = this.resolve(input.destination, selectable);
    const originStopIds = dedupeCandidateStops(
        expandStopSelection(d.snapshot, origin.stopId, stops)
      ),
      destinationStopIds = dedupeCandidateStops(
        expandStopSelection(d.snapshot, destination.stopId, stops)
      );
    if (!origin.stopId) origin.name = 'your starting point';
    if (!destination.stopId) destination.name = 'your destination';
    if (distance(origin.coordinates, destination.coordinates) < 1) {
      return {
        status: 'already_at_destination',
        validFrom: d.validFrom,
        validTo: d.validTo,
        departureAt: input.departureAt ?? null,
        datasetVersion: d.version,
        verification: d.verification,
        sourceUrl: d.sourceUrl,
        origin,
        destination,
        journeys: [],
        warnings: ['You are already at your destination.'],
      };
    }
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
      departureAt: input.departureAt ?? null,
      datasetVersion: d.version,
      verification: d.verification,
      sourceUrl: d.sourceUrl,
      origin,
      destination,
      journeys: [],
      warnings,
    };
    let failed = false;
    let candidatesTruncated = false;
    const candidates = async (
      location: ResolvedLocation,
      reversed: boolean,
      oppositeStopIds: string[]
    ) => {
      const discovered = location.stopId
        ? dedupeCandidateStops(
            expandStopSelection(d.snapshot, location.stopId, stops)
          ).map((stop_id) => ({ stop_id }))
        : ((await this.db.query(
            `SELECT stop_id, MIN(ST_Distance(location::geography,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography)) AS distance
        FROM pattern_stops WHERE dataset_id=$1 AND ST_DWithin(location::geography,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,$4)
        GROUP BY stop_id ORDER BY distance,stop_id LIMIT 64`,
            [d.id, ...location.coordinates, maxWalkMeters]
          )) as { stop_id: string }[]);
      const prioritized = prioritizeDirectCandidates(
        discovered.map((s) => s.stop_id),
        d.snapshot,
        oppositeStopIds,
        reversed
      );
      const selected = selectBoardingCandidates(
        prioritized,
        d.snapshot,
        candidateLimit,
        reversed
      );
      if (
        selectBoardingCandidates(
          discovered.map((s) => s.stop_id),
          d.snapshot,
          Number.MAX_SAFE_INTEGER,
          reversed
        ).length > selected.length ||
        discovered.length === 64
      )
        candidatesTruncated = true;
      const found = selected.map((stop_id) => ({ stop_id }));
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
          const addNavigationHandoff = () => {
            // Only arbitrary endpoints get an unverified handoff. This never
            // invents a transfer/crossing between explicitly selected stops.
            if (location.stopId) return;
            const leg = unverifiedAccessWalk(
              reversed ? stopLocation : location,
              reversed ? location : stopLocation
            );
            if (leg.distanceMeters <= maxWalkMeters) legs.set(stop.id, leg);
          };
          try {
            const leg = await walk(
              reversed ? stopLocation : location,
              reversed ? location : stopLocation
            );
            if (leg && leg.distanceMeters <= maxWalkMeters)
              legs.set(stop.id, leg);
            // A missing mapped footpath is not proof that a boarding point is
            // unreachable. Keep the handoff explicit and the path unverified.
            if (!leg) addNavigationHandoff();
          } catch (e) {
            if (e instanceof WalkingProviderUnavailable) {
              failed = true;
              addNavigationHandoff();
            } else throw e;
          }
        })
      );
      return { found: discovered, legs };
    };
    const [access, egress] = await Promise.all([
      candidates(origin, false, destinationStopIds),
      candidates(destination, true, originStopIds),
    ]);
    const search = searchJourneys(d.snapshot, access.legs, egress.legs, {
      ...input,
      allowScheduled: d.verification === 'verified',
    });
    result.journeys = search.journeys;
    let limited = search.searchLimitReached || candidatesTruncated;
    let noService = false;
    // The initial cap protects walking providers and graph search latency. If
    // it discarded all usable boarding points, retry this request once with a
    // wider set instead of making the passenger submit the same search again.
    if (!result.journeys.length && candidatesTruncated && candidateLimit < 48)
      return this.calculatePlan(input, automaticRadius, walkingChecks, 48);
    if (
      input.departureAt &&
      !result.journeys.length &&
      d.verification === 'verified'
    ) {
      // Distinguish missing timetable service from a disconnected network. Run
      // this bounded topology check only after the time-aware search finds none.
      const topology = searchJourneys(d.snapshot, access.legs, egress.legs, {
        ...input,
        departureAt: undefined,
      });
      limited ||= topology.searchLimitReached;
      noService = topology.journeys.length > 0;
    }

    // A nearby pedestrian journey must not depend on transit coverage, stop-vs-
    // coordinate selection, or a failed unrelated boarding-point lookup.
    if (
      (!result.journeys.length ||
        result.journeys.every((j) =>
          j.legs.some(
            (leg) => leg.kind === 'walk' && leg.quality === 'unverified-access'
          )
        )) &&
      distance(origin.coordinates, destination.coordinates) <= maxWalkMeters
    ) {
      try {
        const direct = await walk(origin, destination);
        if (direct && direct.distanceMeters <= maxWalkMeters) {
          result.journeys = [
            enrichJourney(
              {
                id: createHash('sha256')
                  .update(
                    JSON.stringify([
                      'walk',
                      origin.coordinates,
                      destination.coordinates,
                    ])
                  )
                  .digest('hex')
                  .slice(0, 16),
                legs: [direct],
                transfers: 0,
                walkingMeters: direct.distanceMeters,
                ridingMeters: 0,
                durationSeconds: direct.durationSeconds,
                fareRwf: 0,
                timingStatus: 'estimated',
              },
              d.snapshot.patterns
            ),
          ];
          result.status = 'walking_only';
        }
      } catch (error) {
        if (error instanceof WalkingProviderUnavailable) failed = true;
        else throw error;
      }
    }
    // Default planning seeks the nearest usable connection instead of treating
    // an arbitrary 800 m cutoff as the boundary of the bus network.
    if (
      !result.journeys.length &&
      input.maxWalkMeters === undefined &&
      (!origin.stopId || !destination.stopId) &&
      automaticRadius < 5000
    ) {
      const nextRadius =
        automaticRadius < 1500 ? 1500 : automaticRadius < 2000 ? 2000 : 5000;
      return this.calculatePlan(
        input,
        nextRadius,
        walkingChecks,
        candidateLimit
      );
    }
    if (result.status !== 'walking_only') {
      if (limited) result.status = 'search_limit_reached';
      else if (result.journeys.length)
        result.status =
          input.departureAt &&
          result.journeys.some((j) => j.timingStatus !== 'scheduled')
            ? 'service_timing_unknown'
            : 'ok';
      else if (failed) result.status = 'provider_unavailable';
      else if (!access.found.length || !egress.found.length)
        result.status = 'outside_coverage';
      else result.status = noService ? 'no_service_at_time' : 'no_connection';
    }
    if (
      result.status === 'no_connection' ||
      result.status === 'provider_unavailable'
    )
      result.nearbyConnections = nearbyStopConnections(
        d.snapshot,
        origin,
        destination,
        maxWalkMeters
      );
    if (limited)
      result.warnings.push(
        'The bounded search omitted some candidates or alternatives. This is not proof that no connection exists. Select precise stops or adjust preferences.'
      );
    if (input.departureAt)
      result.warnings.push(
        'Timetable planning considers departures in the next 24 hours. Scheduled times are not live predictions; unknown waiting times remain unknown.'
      );
    const unverifiedAccess = result.journeys.some((j) =>
      j.legs.some(
        (leg) => leg.kind === 'walk' && leg.quality === 'unverified-access'
      )
    );
    if (
      input.maxWalkMeters === undefined &&
      result.journeys.some((j) =>
        j.legs.some((leg) => leg.kind === 'walk' && leg.distanceMeters > 800)
      )
    )
      result.warnings.push(
        'The nearest connection needs more than 800 m of walking at one end. Check the distance or set a walking limit.'
      );
    if (unverifiedAccess)
      result.warnings.push(
        'Walking paths could not be checked. Access distances are straight-line minimums, not street routes. Open walking navigation for each end before travelling.'
      );
    else if (failed)
      result.warnings.push(
        'Some walking connections could not be checked. Select a bus stop directly or try again.'
      );
    return result;
  }

  async compareDraft(id: string) {
    const draft = await this.draft(id);
    let published: NetworkSnapshot | null = null;
    let publishedVersion: string | null = null;
    try {
      const current = await this.dataset();
      published = current.snapshot;
      publishedVersion = current.version;
    } catch {
      published = null;
    }
    return {
      draftId: draft.id,
      draftVersion: draft.version,
      publishedVersion,
      report: compareSnapshots(published, draft.snapshot),
    };
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
    if (values.snapshot!.transfers.some((t) => t.reviewed || t.review))
      throw new BadRequestException(
        'Imported transfers require a new staff review. Keep them unreviewed without approval metadata.'
      );
    const provenance = values.snapshot!.importProvenance;
    if (
      provenance &&
      (provenance.namespace !== values.source ||
        provenance.sourceUrl !== values.sourceUrl ||
        provenance.checksum !== values.checksum)
    )
      throw new BadRequestException(
        'Imported source metadata must match the archive provenance.'
      );
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
    return { ...d, snapshotRevision: snapshotRevision(d.snapshot) };
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
    snapshot.transfers.forEach((t) => {
      t.reviewed = false;
      delete t.review;
    });
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
      if (
        d.snapshot.importProvenance &&
        snapshotRevision(d.snapshot.importProvenance) !==
          snapshotRevision(snapshot.importProvenance ?? null)
      )
        throw new BadRequestException(
          'Original import provenance cannot be changed or removed. Import a new archive instead.'
        );
      for (const t of snapshot.transfers) {
        if (
          t.reviewed &&
          JSON.stringify(t.review) !==
            JSON.stringify(
              d.snapshot.transfers.find((old) => old.id === t.id)?.review
            )
        )
          throw new BadRequestException(
            'Transfer approval can only be created through staff review, not the snapshot editor.'
          );
      }
      d.snapshot = snapshot;
      d.validFrom = snapshot.patterns.map((p) => p.service.validFrom).sort()[0];
      d.validTo = snapshot.patterns.map((p) => p.service.validTo).sort()[0];
      await manager.save(d);
      await this.project(manager, d);
      return d;
    });
  }
  async reviewTransfer(
    id: string,
    transferId: string,
    reviewerId: string,
    evidence: { evidenceUrl: string; notes: string; expectedRevision: string }
  ) {
    return this.db.transaction(async (manager) => {
      const d = await manager.findOne(NetworkDataset, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!d || d.status !== 'draft')
        throw new ConflictException(
          'Only saved draft transfers can be reviewed.'
        );
      if (snapshotRevision(d.snapshot) !== evidence.expectedRevision)
        throw new ConflictException(
          'This draft changed. Reload and inspect the path before approving it.'
        );
      const t = d.snapshot.transfers.find((t) => t.id === transferId);
      if (!t) throw new NotFoundException('Transfer not found in this draft.');
      const stops = new Map(
        d.snapshot.patterns.flatMap((p) =>
          p.stops.map((s) => [s.id, s] as const)
        )
      );
      const issues = transferPathIssues(t, stops);
      if (issues.length) throw new BadRequestException(issues);
      t.reviewed = true;
      t.review = {
        reviewerId,
        reviewedAt: new Date().toISOString(),
        evidenceUrl: evidence.evidenceUrl,
        notes: evidence.notes.trim(),
        contentHash: transferContentHash(t, stops),
      };
      const validation = validateSnapshot(d.snapshot);
      if (validation.length)
        throw new BadRequestException({
          message: 'Resolve draft validation errors before review.',
          data: validation,
        });
      await manager.save(d);
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
