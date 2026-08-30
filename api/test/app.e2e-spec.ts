import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { sign } from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureHttp } from '../src/common/configure-http';
import { NetworkService } from '../src/modules/network/network.service';
import {
  NetworkDataset,
  SavedItem,
  PassengerReport,
} from '../src/entities/networkDataset.entity';
import { User } from '../src/entities/user.entity';
import { snapshot } from '../src/modules/network/network.fixtures';
import { UUID } from '../src/types';

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
      { ...plan, destination: { stopId: 'A' } },
      { destination: { stopId: 'A' } },
    ]) {
      await request(app.getHttpServer())
        .post('/api/journeys/plan')
        .send(body)
        .expect(400);
    }
  });
  it('distinguishes outside coverage and no connection', async () => {
    const outside = await request(app.getHttpServer())
      .post('/api/journeys/plan')
      .send({ ...plan, origin: { latitude: 0, longitude: 0 } })
      .expect(200);
    expect(outside.body.data.status).toBe('outside_coverage');
    const reverse = await request(app.getHttpServer())
      .post('/api/journeys/plan')
      .send({ origin: { stopId: 'F' }, destination: { stopId: 'A' } })
      .expect(200);
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
});
