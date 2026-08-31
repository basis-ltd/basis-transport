import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { sign } from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureHttp } from '../src/common/configure-http';
import { NetworkService } from '../src/modules/network/network.service';
import { WalkingService } from '../src/modules/network/walking.service';
import {
  NetworkDataset,
  SavedItem,
  PassengerReport,
} from '../src/entities/networkDataset.entity';
import { User } from '../src/entities/user.entity';
import { Role } from '../src/entities/role.entity';
import { UserRole } from '../src/entities/userRole.entity';
import {
  snapshot,
  reviewedFixtureTransfer,
} from '../src/modules/network/network.fixtures';
import type { TransferLink } from '../src/modules/network/network.types';
import { UUID } from '../src/types';
import { importGtfs } from '../src/modules/network/gtfs-importer';
import { terminalFeed } from '../src/modules/network/gtfs-terminal.fixtures';

describe('Public planner and migration integration (isolated PostGIS only)', () => {
  let app: INestApplication, db: DataSource, network: NetworkService;
  let owner: User, other: User, ownerToken: string, otherToken: string;
  let originalPublished: string | undefined;
  beforeAll(async () => {
    if (
      !/^basis_planner_test_[a-z0-9_]+$/.test(process.env.DB_NAME || '') ||
      process.env.NETWORK_ACCESS !== 'internal'
    ) {
      throw new Error(
        'Set DB_NAME to an isolated basis_planner_test_* database and NETWORK_ACCESS=internal. Never run against a developer database.'
      );
    }
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ bodyParser: false, logger: false });
    configureHttp(app);
    await app.init();
    db = app.get(DataSource);
    network = app.get(NetworkService);
    originalPublished = (
      await db.getRepository(NetworkDataset).findOneBy({ status: 'published' })
    )?.id;
    const draft = await network.createDraft({
      version: 'test-' + Date.now(),
      source: 'synthetic',
      sourceUrl: 'https://example.org/fixture',
      checksum: 'test',
      verification: 'historic',
      rightsStatus: 'unclear',
      rightsEvidence: '',
      verificationEvidence: '',
      validFrom: '2019-01-01',
      validTo: '2021-01-01',
      snapshot: snapshot(),
      issues: [],
    });
    await network.publish(draft.id);
    owner = await db
      .getRepository(User)
      .save({ name: 'Planner test owner', isProfileComplete: true });
    other = await db
      .getRepository(User)
      .save({ name: 'Planner test other', isProfileComplete: true });
    ownerToken = sign({ id: owner.id }, process.env.JWT_SECRET!, {
      expiresIn: '5m',
    });
    otherToken = sign({ id: other.id }, process.env.JWT_SECRET!, {
      expiresIn: '5m',
    });
  }, 30000);
  afterAll(async () => {
    if (db) {
      await db.getRepository(SavedItem).delete({ userId: owner.id });
      await db.getRepository(SavedItem).delete({ userId: other.id });
      // Preserve unrelated restored data. Test-created users have no legacy links.
      await db.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [
        [owner.id, other.id],
      ]);
      if (originalPublished) await network.publish(originalPublished);
    }
    if (app) await app.close();
  });
  const plan = {
    origin: { stopId: 'A' },
    destination: { stopId: 'F' },
    maxTransfers: 2,
    maxWalkMeters: 800,
  };
  it('imports terminals and multilingual names into public discovery and a continuous platform-specific journey', async () => {
    const previous = await network.dataset();
    const imported = await importGtfs(
      await terminalFeed(),
      'synthetic-terminal',
      'https://example.org/fixture.zip'
    );
    const values = {
      ...imported,
      version: `terminal-test-${Date.now()}`,
      source: 'synthetic-terminal',
      sourceUrl: 'https://example.org/fixture.zip',
      verification: 'historic' as const,
      rightsStatus: 'unclear' as const,
    };
    await expect(
      network.createDraft({ ...values, sourceUrl: 'https://example.org/wrong' })
    ).rejects.toThrow('must match');
    const draft = await network.createDraft(values);
    const altered = structuredClone(draft.snapshot);
    altered.importProvenance!.retrievedAt = '2020-01-01T00:00:00Z';
    await expect(network.edit(draft.id, altered)).rejects.toThrow(
      'cannot be changed'
    );
    try {
      await network.publish(draft.id);
      const search = await request(app.getHttpServer())
        .get('/api/stops?q=Ahantu')
        .set('Authorization', 'Bearer expired')
        .expect(200);
      expect(search.body.data.rows.map((s: { id: string }) => s.id)).toEqual([
        'SYNTHETIC-TERMINAL_A',
      ]);
      const terminals = await request(app.getHttpServer())
        .get('/api/stops?q=Ihuriro')
        .expect(200);
      expect(terminals.body.data.rows[0]).toMatchObject({
        id: 'SYNTHETIC-TERMINAL_S',
        terminalArea: true,
        boardingPointCount: 2,
      });
      const detail = await request(app.getHttpServer())
        .get('/api/stops/SYNTHETIC-TERMINAL_S')
        .expect(200);
      expect(detail.body.data.routes).toHaveLength(1);
      expect(
        detail.body.data.stopArea.boardingPoints.map(
          (s: { id: string }) => s.id
        )
      ).toEqual(['SYNTHETIC-TERMINAL_A', 'SYNTHETIC-TERMINAL_B']);
      await request(app.getHttpServer()).get('/api/stops/SHARED').expect(400);
      const platform = await request(app.getHttpServer())
        .get('/api/stops/SYNTHETIC-TERMINAL_A')
        .expect(200);
      expect(platform.body.data).toMatchObject({
        platformCode: '1',
        displayNames: { fr: 'Quai un' },
        sourceRecord: { file: 'stops.txt', recordId: 'A' },
      });
      // Terminal anchor equals A. Real provider adapter returns the legitimate
      // zero-distance endpoint; B's walking request is unavailable in this test.
      const journey = await request(app.getHttpServer())
        .post('/api/journeys/plan')
        .send({
          origin: { stopId: 'SYNTHETIC-TERMINAL_S' },
          destination: { stopId: 'SYNTHETIC-TERMINAL_C' },
        })
        .expect(200);
      expect(journey.body.data.status).toBe('ok');
      const ride = journey.body.data.journeys[0].legs.find(
        (l: { kind: string }) => l.kind === 'ride'
      );
      expect(ride.board.id).toBe('SYNTHETIC-TERMINAL_A');
      expect(ride.alight.id).toBe('SYNTHETIC-TERMINAL_C');
      expect(
        journey.body.data.journeys[0].steps.map((s: { kind: string }) => s.kind)
      ).toEqual(
        expect.arrayContaining(['wait', 'board', 'ride', 'alight', 'arrive'])
      );
    } finally {
      await network.publish(previous.id);
    }
  });
  it('serves guests and ignores expired authentication on public endpoints', async () => {
    await request(app.getHttpServer()).get('/api/stops?q=A').expect(200);
    const response = await request(app.getHttpServer())
      .post('/api/journeys/plan')
      .set('Authorization', 'Bearer expired')
      .send(plan)
      .expect(200);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.journeys[0].transfers).toBe(2);
    expect(response.headers['cache-control']).toBe('no-store');
    const [audit] = await db.query(
      "SELECT count(*) FROM http_audit_logs WHERE http_path='/api/journeys/plan'"
    );
    expect(Number(audit.count)).toBe(0);
  });
  it('validates nested coordinates, walking bounds and identical endpoints', async () => {
    for (const body of [
      { ...plan, origin: { latitude: 999, longitude: 30 } },
      { ...plan, maxWalkMeters: 2001 },
      { destination: { stopId: 'A' } },
    ]) {
      await request(app.getHttpServer())
        .post('/api/journeys/plan')
        .send(body)
        .expect(400);
    }
    const same = await request(app.getHttpServer())
      .post('/api/journeys/plan')
      .send({ ...plan, destination: { stopId: 'A' } })
      .expect(200);
    expect(same.body.data.status).toBe('already_at_destination');
  });
  it('serves a versioned network map to guests, validates filters and keeps public coverage gated', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/network/map?routeId=101&headsign=C')
      .set('Authorization', 'Bearer expired')
      .expect(200);
    expect(response.body.data.patterns).toHaveLength(1);
    expect(
      response.body.data.patterns[0].stops.map((s: { id: string }) => s.id)
    ).toEqual(['A', 'B', 'C']);
    expect(response.body.data.network.version).toMatch(/^test-/);
    await request(app.getHttpServer())
      .get('/api/network/map?q=' + 'x'.repeat(101))
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/network/map?routeId=')
      .expect(400);
    const bounded = await request(app.getHttpServer())
      .get('/api/network/map?limit=999999')
      .expect(200); // Global whitelist strips unsupported parameters.
    expect(bounded.body.data.limits.patterns).toBe(100);
    const mode = process.env.NETWORK_ACCESS;
    try {
      process.env.NETWORK_ACCESS = 'public';
      await request(app.getHttpServer()).get('/api/network/map').expect(503);
    } finally {
      process.env.NETWORK_ACCESS = mode;
    }
  });
  it('returns passenger steps and fare quotes on successful plans', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/journeys/plan')
      .send(plan)
      .expect(200);
    const journey = response.body.data.journeys[0];
    expect(journey.steps?.length).toBeGreaterThan(0);
    expect(journey.steps.some((s: { kind: string }) => s.kind === 'wait')).toBe(
      true
    );
    expect(
      journey.steps.some((s: { kind: string }) => s.kind === 'board')
    ).toBe(true);
    expect(journey.fareQuote).toBeDefined();
  });
  it('validates directional autocomplete and ranks exact direct connections for guests', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/stops?endpoint=origin&otherStopId=C&size=1')
      .set('Authorization', 'Bearer expired')
      .expect(200);
    expect(response.body.data.rows[0]).toMatchObject({
      id: 'A',
      directConnection: true,
      services: [{ routeNumber: '101', headsign: 'C' }],
    });
    const arrivals = await request(app.getHttpServer())
      .get('/api/stops?endpoint=destination&size=100')
      .expect(200);
    expect(
      arrivals.body.data.rows.some((s: { id: string }) => s.id === 'A')
    ).toBe(false);
    await request(app.getHttpServer())
      .get('/api/stops?endpoint=invalid')
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/stops?otherStopId=' + 'x'.repeat(101))
      .expect(400);
  });
  it('distinguishes outside coverage and no connection', async () => {
    const outside = await request(app.getHttpServer())
      .post('/api/journeys/plan')
      .send({ ...plan, origin: { latitude: 0, longitude: 0 } })
      .expect(200);
    expect(outside.body.data.status).toBe('outside_coverage');
    // A nearby reverse search also checks a pedestrian-only alternative. This
    // fixture explicitly has none; never make a paid provider request in tests.
    const walking = jest
      .spyOn(app.get(WalkingService), 'route')
      .mockResolvedValueOnce(null);
    const reverse = await request(app.getHttpServer())
      .post('/api/journeys/plan')
      .send({ origin: { stopId: 'F' }, destination: { stopId: 'A' } })
      .expect(200);
    walking.mockRestore();
    expect(reverse.body.data.status).toBe('no_connection');
  });
  it('protects administration and saved-item ownership', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/network/datasets')
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/admin/network/datasets')
      .auth(ownerToken, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/users')
      .auth(ownerToken, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer()).get('/api/me/saved-items').expect(401);
    const saved = await request(app.getHttpServer())
      .post('/api/me/saved-items')
      .auth(ownerToken, { type: 'bearer' })
      .send({ key: 'stop-A', label: 'A', href: '/stops/A', kind: 'stop' })
      .expect(201);
    const foreign = await request(app.getHttpServer())
      .get('/api/me/saved-items')
      .auth(otherToken, { type: 'bearer' })
      .expect(200);
    expect(foreign.body.data).toEqual([]);
    await request(app.getHttpServer())
      .delete('/api/me/saved-items/' + saved.body.data.id)
      .auth(otherToken, { type: 'bearer' })
      .expect(204);
    expect(
      await db.getRepository(SavedItem).existsBy({ id: saved.body.data.id })
    ).toBe(true);
  });
  it('persists anonymous reports without modifying routing', async () => {
    const before = (await network.dataset()).version;
    const res = await request(app.getHttpServer())
      .post('/api/reports')
      .send({
        kind: 'stop',
        referenceId: 'A',
        message: 'The boarding point needs a review.',
      })
      .expect(201);
    expect(
      await db.getRepository(PassengerReport).existsBy({ id: res.body.data.id })
    ).toBe(true);
    expect((await network.dataset()).version).toBe(before);
    await db.getRepository(PassengerReport).delete(res.body.data.id);
  });
  it('returns 410 for every retired workflow and keeps archive counts unchanged', async () => {
    for (const endpoint of [
      'trips',
      'user-trips',
      'locations',
      'transport-cards',
      'dashboard',
    ]) {
      await request(app.getHttpServer())
        .get('/api/' + endpoint)
        .expect(410);
      await request(app.getHttpServer())
        .post('/api/' + endpoint)
        .send({})
        .expect(410);
    }
    const [manifest] = await db.query(
      'SELECT record_counts FROM legacy_archive_manifest'
    );
    for (const table of [
      'trips',
      'user_trips',
      'locations',
      'transport_cards',
    ]) {
      const [row] = await db.query('SELECT count(*) AS count FROM ' + table);
      expect(Number(row.count)).toBe(Number(manifest.record_counts[table]));
      if (Number(row.count) > 0)
        await expect(
          db.query('UPDATE ' + table + ' SET updated_at = updated_at')
        ).rejects.toThrow('archived read-only');
    }
  });
  it('rolls back invalid drafts and swaps published versions across workers', async () => {
    const before = await network.dataset(),
      count = await db.getRepository(NetworkDataset).count();
    await expect(
      network.createDraft({
        snapshot: { patterns: [null as never], transfers: [] },
      })
    ).rejects.toThrow();
    expect(await db.getRepository(NetworkDataset).count()).toBe(count);
    const clone = await network.clone(before.id);
    await network.publish(clone.id);
    expect((await network.dataset()).id).toBe(clone.id);
    await network.publish(before.id);
    expect((await network.dataset()).id).toBe(before.id);
  });
  it('bounds anonymous planning requests', async () => {
    let rateLimited = false;
    for (let i = 0; i < 25; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/journeys/plan')
        .send(plan);
      if (res.status === 429) {
        rateLimited = true;
        expect(res.headers['retry-after']).toBeDefined();
        break;
      }
    }
    expect(rateLimited).toBe(true);
  });
  it('records staff-only transfer evidence, rejects forged/stale approvals and preserves publication', async () => {
    const published = await network.dataset();
    const d = await network.clone(published.id);
    const path = `/api/admin/network/datasets/${d.id}`;
    const t: TransferLink = {
      id: 'test-pedestrian-link',
      fromStopId: 'B',
      toStopId: 'D',
      distanceMeters: null,
      durationSeconds: null,
      geometry: [],
      source: '',
      pathKind: 'unknown',
      reviewed: false,
      instructions: [],
    };
    d.snapshot.transfers = [t];
    await network.edit(d.id, d.snapshot);
    const body = {
      evidenceUrl: 'https://example.org/synthetic-review',
      notes:
        'Synthetic integration-test crossing, not real-world field evidence.',
      confirm: true,
      expectedRevision: (await network.draft(d.id)).snapshotRevision,
    };
    await request(app.getHttpServer())
      .post(`${path}/transfers/${t.id}/review`)
      .send(body)
      .expect(401);
    await request(app.getHttpServer())
      .post(`${path}/transfers/${t.id}/review`)
      .auth(ownerToken, { type: 'bearer' })
      .send(body)
      .expect(403);
    let role = await db.getRepository(Role).findOneBy({ name: 'ADMIN' });
    const createdRole = !role;
    role ??= await db.getRepository(Role).save({ name: 'ADMIN' });
    const membership = await db
      .getRepository(UserRole)
      .save({ userId: owner.id, roleId: role.id });
    try {
      await request(app.getHttpServer())
        .post(`${path}/transfers/${t.id}/review`)
        .auth(ownerToken, { type: 'bearer' })
        .send(body)
        .expect(400);
      await request(app.getHttpServer())
        .patch(`${path}/snapshot`)
        .auth(ownerToken, { type: 'bearer' })
        .send({ ...d.snapshot, fareRules: [null] })
        .expect(400);
      Object.assign(t, {
        distanceMeters: 50,
        durationSeconds: 70,
        geometry: [
          [30.0066, -1.95],
          [30.0068, -1.95],
        ],
        source: 'synthetic test survey',
        pathKind: 'surveyed',
        instructions: ['Use the marked synthetic test crossing.'],
      });
      await network.edit(d.id, d.snapshot);
      const forged = structuredClone(d.snapshot);
      forged.transfers = [reviewedFixtureTransfer(forged, t)];
      await request(app.getHttpServer())
        .patch(`${path}/snapshot`)
        .auth(ownerToken, { type: 'bearer' })
        .send(forged)
        .expect(400);
      await request(app.getHttpServer())
        .post(`${path}/transfers/${t.id}/review`)
        .auth(ownerToken, { type: 'bearer' })
        .send(body)
        .expect(409);
      const evidence = {
        ...body,
        expectedRevision: (await network.draft(d.id)).snapshotRevision,
      };
      const result = await request(app.getHttpServer())
        .post(`${path}/transfers/${t.id}/review`)
        .auth(ownerToken, { type: 'bearer' })
        .send(evidence)
        .expect(201);
      expect(result.body.data.snapshot.transfers[0].review.reviewerId).toBe(
        owner.id
      );
      const edited = result.body.data.snapshot;
      edited.transfers[0].distanceMeters = 80;
      await request(app.getHttpServer())
        .patch(`${path}/snapshot`)
        .auth(ownerToken, { type: 'bearer' })
        .send(edited)
        .expect(400);
      await request(app.getHttpServer())
        .post(`${path}/transfers/${t.id}/review`)
        .auth(ownerToken, { type: 'bearer' })
        .send(evidence)
        .expect(409);
      expect((await network.dataset()).id).toBe(published.id);
      const reimport = {
        ...d,
        version: 'unsafe-import-' + Date.now(),
        snapshot: forged,
      };
      await expect(network.createDraft(reimport)).rejects.toThrow(
        'new staff review'
      );
    } finally {
      await db.getRepository(UserRole).delete(membership.id);
      if (createdRole) await db.getRepository(Role).delete(role.id);
    }
  });
});
