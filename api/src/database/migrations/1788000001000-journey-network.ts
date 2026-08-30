import { MigrationInterface, QueryRunner } from 'typeorm';

export class JourneyNetwork1788000001000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE network_datasets (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), version varchar NOT NULL UNIQUE,
        source varchar NOT NULL, source_url varchar NOT NULL, checksum varchar NOT NULL,
        status varchar NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
        verification varchar NOT NULL DEFAULT 'historic' CHECK (verification IN ('historic','unverified','verified')),
        rights_status varchar NOT NULL DEFAULT 'unclear' CHECK (rights_status IN ('unclear','approved')),
        rights_evidence text NOT NULL DEFAULT '', verification_evidence text NOT NULL DEFAULT '',
        valid_from date, valid_to date, imported_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
        snapshot jsonb NOT NULL, issues jsonb NOT NULL DEFAULT '[]'::jsonb
      );
      CREATE UNIQUE INDEX one_published_network ON network_datasets (status) WHERE status='published';
      CREATE TABLE route_patterns (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), dataset_id uuid NOT NULL REFERENCES network_datasets(id) ON DELETE CASCADE,
        source_trip_id varchar NOT NULL, route_id varchar NOT NULL, direction varchar NOT NULL,
        UNIQUE(dataset_id, source_trip_id)
      );
      CREATE TABLE pattern_stops (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), dataset_id uuid NOT NULL REFERENCES network_datasets(id) ON DELETE CASCADE,
        pattern_id uuid NOT NULL REFERENCES route_patterns(id) ON DELETE CASCADE,
        stop_id varchar NOT NULL, sequence integer NOT NULL CHECK (sequence>=0), location geometry(Point,4326) NOT NULL,
        UNIQUE(pattern_id, sequence)
      );
      CREATE INDEX pattern_stop_geography ON pattern_stops USING gist ((location::geography));
      CREATE INDEX pattern_stop_dataset ON pattern_stops(dataset_id, stop_id);
      CREATE TABLE saved_items (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key varchar NOT NULL, label varchar NOT NULL, href varchar NOT NULL, kind varchar NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id, key)
      );
      CREATE TABLE passenger_reports (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), kind varchar NOT NULL, reference_id varchar,
        email varchar, name varchar, message text NOT NULL, status varchar NOT NULL DEFAULT 'open',
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX passenger_reports_status ON passenger_reports(status, created_at);
    `);
  }
  async down(q: QueryRunner): Promise<void> {
    const [{ count }] = await q.query('SELECT count(*) FROM network_datasets');
    const [{ saved }] = await q.query(
      'SELECT count(*) AS saved FROM saved_items'
    );
    const [{ reports }] = await q.query(
      'SELECT count(*) AS reports FROM passenger_reports'
    );
    if (+count || +saved || +reports)
      throw new Error(
        'Refusing to remove populated planner tables. Restore a verified backup.'
      );
    await q.query(
      'DROP TABLE passenger_reports, saved_items, pattern_stops, route_patterns, network_datasets'
    );
  }
}
