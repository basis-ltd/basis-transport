import { importGtfs } from './gtfs-importer';
import { importStops } from './gtfs-stops';
import { terminalFeed } from './gtfs-terminal.fixtures';
import { validateSnapshot } from './network.validation';
import { terminalSearchResults, expandStopSelection } from './stop-areas';
import type { QualityIssue } from './network.types';

const load = async (overrides: Record<string, string | null> = {}) =>
  importGtfs(
    await terminalFeed(overrides),
    'synthetic-terminal',
    'https://example.org/authorized-fixture.zip',
    '2026-01-01T00:00:00Z'
  );
describe('GTFS terminal, translation and provenance import', () => {
  it('retains distinct same-name platforms, station hierarchy, translations and original records', async () => {
    const result = await load();
    expect(validateSnapshot(result.snapshot)).toEqual([]);
    const [a, b] = result.snapshot.patterns[0].stops;
    expect(a).toMatchObject({
      id: 'SYNTHETIC-TERMINAL_A',
      code: 'SHARED',
      platformCode: '1',
      stopAreaId: 'SYNTHETIC-TERMINAL_S',
      displayNames: { fr: 'Quai un', rw: 'Ahantu ha mbere' },
      sourceRecord: {
        namespace: 'synthetic-terminal',
        file: 'stops.txt',
        recordId: 'A',
      },
      stopTimeRecord: {
        file: 'stop_times.txt',
        recordId: 'out',
        recordSubId: '1',
      },
    });
    expect(b).toMatchObject({
      platformCode: '2',
      displayNames: { fr: 'Arrêt central' },
    });
    expect(a.id).not.toBe(b.id);
    const area = result.snapshot.stopAreas![0];
    expect(area.boardingPointIds).toEqual([a.id, b.id]);
    expect(
      result.snapshot.patterns
        .flatMap((p) => p.stops)
        .some((s) => s.id === area.id)
    ).toBe(false);
    expect(expandStopSelection(result.snapshot, area.id, [a, b])).toEqual([
      a.id,
      b.id,
    ]);
    expect(expandStopSelection(result.snapshot, a.id, [a, b])).toEqual([a.id]);
    expect(
      terminalSearchResults(result.snapshot, 'ihuriro', (v) =>
        v.toLowerCase()
      )[0].id
    ).toBe(area.id);
    expect(result.snapshot.transfers).toEqual([]);
    expect(result.snapshot.importProvenance).toMatchObject({
      namespace: 'synthetic-terminal',
      sourceUrl: 'https://example.org/authorized-fixture.zip',
      checksum: result.checksum,
      retrievedAt: '2026-01-01T00:00:00Z',
      feedVersion: 'fixture-v1',
      feedLanguage: 'en',
    });
    expect(result.validTo).toBe('2021-02-25');
    expect(
      result.snapshot.patterns.every(
        (p) => p.service.timetable?.verified === false
      )
    ).toBe(true);
    expect(result.snapshot.patterns[0].routeSourceRecord?.recordId).toBe('r');
  });
  it('keeps reimported source identities stable without claiming a fresh retrieval', async () => {
    const bytes = await terminalFeed();
    const a = await importGtfs(bytes, 'synthetic-terminal'),
      b = await importGtfs(bytes, 'synthetic-terminal');
    expect(a.checksum).toBe(b.checksum);
    expect(a.snapshot.patterns[0].routeId).toBe(b.snapshot.patterns[0].routeId);
    expect(a.snapshot.patterns[0].stops.map((s) => s.id)).toEqual(
      b.snapshot.patterns[0].stops.map((s) => s.id)
    );
    expect(a.snapshot.importProvenance?.retrievedAt).toBeNull();
  });
  it('quarantines conflicting specific translations, without falling back or merging stops', async () => {
    const base =
      'table_name,field_name,language,translation,record_id,field_value\nstops,stop_name,fr,Generic,,Central\nstops,stop_name,fr,First,A,\nstops,stop_name,FR,Second,A,';
    for (const rows of [
      base,
      base
        .split('\n')
        .slice(0, 1)
        .concat(base.split('\n').slice(1).reverse())
        .join('\n'),
    ]) {
      const result = await load({ 'translations.txt': rows });
      expect(
        result.snapshot.patterns[0].stops[0].displayNames?.fr
      ).toBeUndefined();
      expect(result.snapshot.patterns[0].stops[1].displayNames?.fr).toBe(
        'Generic'
      );
      expect(
        result.issues.some((i) => i.message.includes('conflicting fr'))
      ).toBe(true);
    }
  });
  it('rejects missing translation metadata and quarantines malformed references and locale tags', async () => {
    await expect(load({ 'feed_info.txt': null })).rejects.toThrow(
      'requires feed_info'
    );
    const result = await load({
      'translations.txt':
        'table_name,field_name,language,translation,record_id,field_value\nstops,stop_name,en_US,Invalid,A,\nstops,stop_name,fr,Missing,absent,\nstops,stop_name,fr,Both,A,Central\nstops,stop_name,en-US,Valid,A,',
    });
    expect(result.snapshot.patterns[0].stops[0].displayNames).toEqual({
      'en-US': 'Valid',
    });
    expect(
      result.issues.filter((i) =>
        i.message.startsWith('Translation quarantined')
      )
    ).toHaveLength(3);
  });
  it('quarantines affected patterns when a platform has an invalid parent, not just the occurrence', async () => {
    const result = await load({
      'stops.txt':
        'stop_id,stop_name,stop_lat,stop_lon,parent_station\nA,Alpha,-1.95,30,\nB,Bravo,-1.95,30.001,A\nC,Charlie,-1.95,30.02,',
    });
    expect(result.snapshot.patterns.map((p) => p.sourceTripId)).toEqual([
      'back',
    ]);
    expect(
      result.issues.some(
        (i) => i.reference === 'B' && i.message.includes('parent_station')
      )
    ).toBe(true);
    expect(validateSnapshot(result.snapshot)).toEqual([]);
  });
  it('rejects stations in stop_times, missing stop references, and duplicate identities instead of skipping them', async () => {
    for (const id of ['S', 'missing']) {
      const result = await load({
        'stop_times.txt': `trip_id,arrival_time,departure_time,stop_id,stop_sequence\nout,08:00:00,08:00:00,A,1\nout,08:05:00,08:05:00,${id},2\nout,08:10:00,08:10:00,C,3\nback,09:00:00,09:00:00,C,1\nback,09:10:00,09:10:00,A,2`,
      });
      expect(result.snapshot.patterns.map((p) => p.sourceTripId)).toEqual([
        'back',
      ]);
    }
    const result = await load({
      'stops.txt':
        'stop_id,stop_name,stop_lat,stop_lon\nA,Alpha,-1.95,30\nB,Bravo,-1.95,30.001\nB,Another Bravo,-1.95,30.002\nC,Charlie,-1.95,30.02',
    });
    expect(result.snapshot.patterns.map((p) => p.sourceTripId)).toEqual([
      'back',
    ]);
    expect(
      result.issues.some((i) => i.message.includes('duplicate source identity'))
    ).toBe(true);
  });
  it('does not grant boarding access through nodes, entrances or cyclic station hierarchies', () => {
    const issues: QualityIssue[] = [];
    const result = importStops(
      [
        {
          stop_id: 'S',
          stop_name: 'Station',
          stop_lat: '-1.95',
          stop_lon: '30',
          location_type: '1',
          parent_station: 'S',
        },
        {
          stop_id: 'A',
          stop_name: 'Platform',
          stop_lat: '-1.95',
          stop_lon: '30',
          location_type: '0',
          parent_station: 'S',
        },
        {
          stop_id: 'E',
          stop_name: 'Entrance',
          stop_lat: '-1.95',
          stop_lon: '30',
          location_type: '2',
        },
      ],
      [],
      'synthetic',
      issues
    );
    expect(result.stops.size).toBe(0);
    expect([...result.invalidStops]).toEqual(
      expect.arrayContaining(['S', 'A', 'E'])
    );
  });
  it('validates nested provenance and language fields without throwing', async () => {
    const { snapshot } = await load();
    for (const mutate of [
      (s: typeof snapshot) => {
        s.importProvenance!.checksum = 'bad';
      },
      (s: typeof snapshot) => {
        s.patterns[0].stops[0].sourceRecord!.namespace = 'other';
      },
      (s: typeof snapshot) => {
        s.patterns[0].stops[0].stopTimeRecord!.recordId = 'another-trip';
      },
      (s: typeof snapshot) => {
        s.stopAreas![0].displayNames = { en_US: 'Invalid' };
      },
    ]) {
      const bad = structuredClone(snapshot);
      mutate(bad);
      expect(validateSnapshot(bad).length).toBeGreaterThan(0);
    }
  });
});
