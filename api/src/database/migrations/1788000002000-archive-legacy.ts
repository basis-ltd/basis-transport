import { MigrationInterface, QueryRunner } from 'typeorm';

export class ArchiveLegacy1788000002000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE legacy_archive_manifest (id integer PRIMARY KEY DEFAULT 1 CHECK (id=1), archived_at timestamptz NOT NULL DEFAULT now(), record_counts jsonb NOT NULL);
      INSERT INTO legacy_archive_manifest(record_counts) SELECT jsonb_build_object('trips',(SELECT count(*) FROM trips),'user_trips',(SELECT count(*) FROM user_trips),'locations',(SELECT count(*) FROM locations),'transport_cards',(SELECT count(*) FROM transport_cards));
      CREATE FUNCTION reject_legacy_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Legacy transport records are archived read-only'; END $$;
      CREATE TRIGGER archived_trips BEFORE INSERT OR UPDATE OR DELETE ON trips FOR EACH ROW EXECUTE FUNCTION reject_legacy_write();
      CREATE TRIGGER archived_user_trips BEFORE INSERT OR UPDATE OR DELETE ON user_trips FOR EACH ROW EXECUTE FUNCTION reject_legacy_write();
      CREATE TRIGGER archived_locations BEFORE INSERT OR UPDATE OR DELETE ON locations FOR EACH ROW EXECUTE FUNCTION reject_legacy_write();
      CREATE TRIGGER archived_transport_cards BEFORE INSERT OR UPDATE OR DELETE ON transport_cards FOR EACH ROW EXECUTE FUNCTION reject_legacy_write();
      DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE name::text LIKE 'TRIP_%');
    `);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(
      `DROP TRIGGER archived_trips ON trips; DROP TRIGGER archived_user_trips ON user_trips; DROP TRIGGER archived_locations ON locations; DROP TRIGGER archived_transport_cards ON transport_cards; DROP FUNCTION reject_legacy_write(); DROP TABLE legacy_archive_manifest;`
    );
    // Legacy permissions are intentionally not regranted by a rollback.
  }
}
