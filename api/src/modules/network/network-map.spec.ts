import { MAP_LIMITS, projectNetworkMap } from './network-map';
import { pattern, snapshot } from './network.fixtures';
import {
  ECOFLEET_PUBLISHED_ROUTE_LABELS,
  withEcofleetOverlay,
} from './ecofleet-overlay';

describe('Bounded public network map projection', () => {
  it('filters actual directions, excluding disabled patterns without merging repeated occurrences', () => {
    const forward = pattern('101', ['A', 'B', 'A', 'C']);
    const reverse = pattern('101', ['C', 'B', 'A']);
    const hidden = { ...pattern('999', ['X', 'Z']), enabled: false };
    const data = projectNetworkMap(
      { patterns: [forward, reverse, hidden], transfers: [] },
      { headsign: 'C', routeId: '101' }
    );
    expect(data.patterns).toHaveLength(1);
    expect(data.patterns[0].stops.map((s) => [s.id, s.sequence])).toEqual([
      ['A', 0],
      ['B', 1],
      ['A', 2],
      ['C', 3],
    ]);
    expect(data.filters.routes.map((r) => r.id)).toEqual(['101']);
    expect(data.patterns[0].geometryQuality).toBe('schematic');
  });
  it('uses only source shapes and labels lossy overview geometry', () => {
    const data = snapshot();
    data.patterns[0].geometry = Array.from({ length: 500 }, (_, i) => [
      30 + i / 10000,
      -1.95,
    ]);
    const result = projectNetworkMap(data, {
      q: '101',
      agency: 'Test operator',
    }).patterns[0];
    expect(result.geometryQuality).toBe('source-shape');
    expect(result.generalized).toBe(true);
    expect(result.geometry).toHaveLength(MAP_LIMITS.points);
    expect(result.geometry[0]).toEqual(data.patterns[0].geometry[0]);
    expect(result.geometry.at(-1)).toEqual(data.patterns[0].geometry.at(-1));
    expect(data.patterns[0].geometry).toHaveLength(500);
  });
  it('bounds paths and stop payloads, announces incompleteness and permits route refinement', () => {
    const data = {
      patterns: Array.from({ length: 120 }, (_, i) =>
        pattern(String(i), Array(250).fill('A'))
      ),
      transfers: [],
    };
    const result = projectNetworkMap(data, {});
    expect(result.totalPatterns).toBe(120);
    expect(result.patterns).toHaveLength(MAP_LIMITS.patterns);
    expect(result.patterns.reduce((n, p) => n + p.stops.length, 0)).toBe(
      MAP_LIMITS.totalStops
    );
    expect(result.truncated).toBe(true);
    expect(result.patterns[0].stopCount).toBe(250);
    expect(result.patterns[0].stopsTruncated).toBe(true);
    const refined = projectNetworkMap(data, { routeId: '119' });
    expect(refined.patterns).toHaveLength(1);
    expect(refined.patterns[0].routeNumber).toBe('119');
  });
  it('keeps Ecofleet published corridors in a truncated overview', () => {
    const historic = Array.from({ length: 120 }, (_, i) =>
      pattern(String(i + 100), ['A', 'B'])
    );
    const result = projectNetworkMap(
      withEcofleetOverlay({ patterns: historic, transfers: [] }),
      {}
    );
    expect(result.truncated).toBe(true);
    expect(result.patterns).toHaveLength(MAP_LIMITS.patterns);
    const names = [
      ...result.filters.routes.map((r) => r.name),
      ...result.patterns.map((p) => p.routeName),
    ];
    for (const label of ECOFLEET_PUBLISHED_ROUTE_LABELS) {
      expect(names).toContain(label);
    }
    expect(
      result.patterns.some((p) => p.routeId.startsWith('ecofleet-corridor-'))
    ).toBe(true);
  });
  it('returns an honest empty match rather than unrelated nearby routes', () => {
    expect(
      projectNetworkMap(snapshot(), { routeId: 'missing' }).patterns
    ).toEqual([]);
    expect(
      projectNetworkMap(snapshot(), { headsign: 'nowhere' }).totalPatterns
    ).toBe(0);
  });
});
