import {
  expandStopSelection,
  dedupeCandidateStops,
  terminalSearchResults,
} from './stop-areas';
import { kabugaDowntownWithTransferSnapshot } from './kigali-reference.fixtures';
import { searchJourneys } from './journey-engine';
import { access } from './network.fixtures';

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
    const { journeys } = searchJourneys(
      snap,
      access('KABUGA'),
      access('CBD'),
      { maxTransfers: 2, preference: 'fewest_transfers' }
    );
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
});
