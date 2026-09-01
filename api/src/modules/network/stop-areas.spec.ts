import {
  expandStopSelection,
  dedupeCandidateStops,
  nearbyStopIds,
  prioritizeDirectCandidates,
  terminalSearchResults,
} from './stop-areas';
import { kabugaDowntownWithTransferSnapshot } from './kigali-reference.fixtures';
import { searchJourneys } from './journey-engine';
import { access, pattern } from './network.fixtures';

describe('Stop areas', () => {
  it('expands area selection into boarding points', () => {
    const snap = kabugaDowntownWithTransferSnapshot();
    const stops = [
      ...new Map(
        snap.patterns.flatMap((p) => p.stops.map((s) => [s.id, s] as const))
      ).values(),
    ];
    expect(expandStopSelection(snap, 'AREA_REMERA', stops)).toEqual([
      'REMERA_111',
      'REMERA_101',
    ]);
    expect(dedupeCandidateStops(['B', 'B', 'C'])).toEqual(['B', 'C']);
  });

  it('plans Kabuga–Downtown when area transfer is reviewed', () => {
    const snap = kabugaDowntownWithTransferSnapshot();
    const { journeys } = searchJourneys(snap, access('KABUGA'), access('CBD'), {
      maxTransfers: 2,
      preference: 'fewest_transfers',
    });
    expect(journeys[0].transfers).toBe(1);
  });

  it('returns terminal areas matching a search query', () => {
    const snap = kabugaDowntownWithTransferSnapshot();
    const results = terminalSearchResults(snap, 'remera', (v) =>
      v.toLowerCase()
    );
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('AREA_REMERA');
  });

  it('prioritizes nearby candidates that connect in the requested direction', () => {
    const snap = {
      patterns: [pattern('direct', ['A', 'B', 'C'])],
      transfers: [],
    };
    expect(
      prioritizeDirectCandidates(['X', 'A', 'B'], snap, ['C'], false)
    ).toEqual(['A', 'B', 'X']);
    expect(
      prioritizeDirectCandidates(['X', 'C', 'B'], snap, ['A'], true)
    ).toEqual(['C', 'B', 'X']);
  });

  it('lists snapshot stops within a walking radius of a coordinate', () => {
    const p = pattern('direct', ['A', 'B', 'C']);
    p.stops[0].coordinates = [30.06, -1.95];
    p.stops[1].coordinates = [30.08, -1.95];
    p.stops[2].coordinates = [30.1, -1.95];
    expect(nearbyStopIds(p.stops, p.stops[0].coordinates, 50)).toEqual(['A']);
    expect(nearbyStopIds(p.stops, [0, 0], 50)).toEqual([]);
  });
});
