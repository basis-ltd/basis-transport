import { searchJourneys } from './journey-engine';
import {
  kabugaDowntownSnapshot,
  kabugaDowntownWithTransferSnapshot,
  kimironkoNyabugogoSnapshot,
  remeraDowntownSnapshot,
} from './kigali-reference.fixtures';
import { access } from './network.fixtures';

const options = { maxTransfers: 2, preference: 'fewest_transfers' as const };

describe('Kigali reference fixtures', () => {
  it('Remera–Downtown: direct connection with section fare and passenger steps', () => {
    const { journeys } = searchJourneys(
      remeraDowntownSnapshot(),
      access('REMERA'),
      access('CBD'),
      options
    );
    expect(journeys).toHaveLength(1);
    expect(journeys[0].transfers).toBe(0);
    expect(journeys[0].fareQuote?.status).toBe('known');
    expect(journeys[0].fareQuote?.total).toBe(426);
    const kinds = (journeys[0].steps ?? []).map((s) => s.kind);
    expect(kinds).toContain('wait');
    expect(kinds).toContain('board');
    expect(kinds).toContain('alight');
    expect(kinds).toContain('arrive');
  });

  it('Kimironko–Nyabugogo: section fares differ by alighting point', () => {
    const snap = kimironkoNyabugogoSnapshot();
    const full = searchJourneys(
      snap,
      access('KIMI'),
      access('NYAB'),
      options
    ).journeys[0];
    const partial = searchJourneys(
      snap,
      access('KIMI'),
      access('STAD'),
      options
    ).journeys[0];
    expect(full.fareQuote?.total).toBe(300);
    expect(partial.fareQuote?.total).toBe(200);
  });

  it('Kabuga–Downtown: unavailable without reviewed transfer', () => {
    const { journeys } = searchJourneys(
      kabugaDowntownSnapshot(),
      access('KABUGA'),
      access('CBD'),
      options
    );
    expect(journeys).toEqual([]);
  });

  it('Kabuga–Downtown: one transfer when Remera link is reviewed', () => {
    const { journeys } = searchJourneys(
      kabugaDowntownWithTransferSnapshot(),
      access('KABUGA'),
      access('CBD'),
      options
    );
    expect(journeys).toHaveLength(1);
    expect(journeys[0].transfers).toBe(1);
    expect(journeys[0].steps?.some((s) => s.kind === 'transfer')).toBe(true);
    const rides = journeys[0].legs.filter((l) => l.kind === 'ride');
    expect(rides.map((r) => r.routeNumber)).toEqual(['111', '101']);
  });
});
