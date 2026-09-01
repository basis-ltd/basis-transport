import { validateSnapshot } from './network.validation';
import { projectNetworkMap } from './network-map';
import { snapshot } from './network.fixtures';
import {
  ECOFLEET_PUBLISHED_CORRIDORS,
  ECOFLEET_PUBLISHED_ROUTE_LABELS,
  ecofleetHubId,
  ecofleetOverlaySnapshot,
  withEcofleetOverlay,
} from './ecofleet-overlay';

describe('Ecofleet published corridor overlay', () => {
  it('builds a valid snapshot of the currently published connecting corridors', () => {
    const overlay = ecofleetOverlaySnapshot();
    expect(validateSnapshot(overlay)).toEqual([]);
    const names = overlay.patterns.map((p) => p.routeName);
    for (const label of ECOFLEET_PUBLISHED_ROUTE_LABELS) {
      expect(names).toContain(label);
    }
    expect(
      overlay.patterns.every((p) => p.enabled && p.agency === 'Ecofleet')
    ).toBe(true);
    expect(
      overlay.patterns.every((p) => p.routeId.startsWith('ecofleet-corridor-'))
    ).toBe(true);
  });

  it('keeps Remera–Downtown, Kimironko–Nyabugogo, Kicukiro–Nyabugogo and Nyamirambo–Downtown rideable', () => {
    const overlay = ecofleetOverlaySnapshot();
    const required = [
      ['Remera Terminal', 'Downtown Terminal', 'Remera ↔ Downtown'],
      ['Kimironko Terminal', 'Nyabugogo Terminal', 'Kimironko ↔ Nyabugogo'],
      ['Kicukiro Centre', 'Nyabugogo Terminal', 'Kicukiro ↔ Nyabugogo'],
      [
        'Nyamirambo Taxi Park',
        'Downtown Terminal',
        'Nyamirambo — Downtown Kigali',
      ],
    ] as const;
    for (const [from, to, route] of required) {
      const pattern = overlay.patterns.find(
        (p) =>
          p.routeName === route &&
          p.stops.some((s) => s.id === ecofleetHubId(from)) &&
          p.stops.some((s) => s.id === ecofleetHubId(to))
      );
      expect(pattern).toBeDefined();
      const board = pattern!.stops.findIndex(
        (s) => s.id === ecofleetHubId(from)
      );
      const alight = pattern!.stops.findIndex(
        (s) => s.id === ecofleetHubId(to)
      );
      expect(board).toBeGreaterThanOrEqual(0);
      expect(alight).toBeGreaterThan(board);
    }
  });

  it('projects every published corridor label on the served map', () => {
    const projected = projectNetworkMap(ecofleetOverlaySnapshot(), {});
    const labels = projected.filters.routes.map((r) => r.name);
    for (const corridor of ECOFLEET_PUBLISHED_CORRIDORS) {
      expect(labels).toContain(corridor.route);
    }
    expect(projected.patterns.length).toBeGreaterThan(0);
  });

  it('merges overlay identities onto a historic snapshot without duplicating or mutating it', () => {
    const historic = snapshot();
    const before = JSON.stringify(historic);
    const merged = withEcofleetOverlay(historic);
    expect(JSON.stringify(historic)).toBe(before);
    expect(validateSnapshot(merged)).toEqual([]);
    expect(merged.patterns.length).toBeGreaterThan(historic.patterns.length);
    expect(withEcofleetOverlay(merged).patterns).toHaveLength(
      merged.patterns.length
    );
    expect(
      merged.patterns
        .filter((p) => p.routeId === '101')
        .map((p) => p.routeNumber)
    ).toEqual(['101']);
  });
});
