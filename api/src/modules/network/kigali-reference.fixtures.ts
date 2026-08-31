/**
 * Synthetic reference fixtures for Kigali corridor regression tests.
 * These are synthetic topologies shaped like known corridors — NOT field-verified
 * service and NOT Bisi ground truth. Use for regression testing planner behaviour.
 */
import { randomUUID } from 'crypto';
import type { NetworkSnapshot } from './network.types';
import { pattern, reviewedFixtureTransfer } from './network.fixtures';

const hub = (id: string, name: string, lng: number, lat: number) => ({
  id,
  code: id,
  name,
  aliases: [],
  coordinates: [lng, lat] as [number, number],
});

/** Kabuga → Downtown: no direct pattern; requires reviewed transfer via Remera. */
export function kabugaDowntownSnapshot(): NetworkSnapshot {
  const kabuga = hub('KABUGA', 'Kabuga bus park', 30.223, -1.979);
  const mulindi = hub('MULINDI', 'Mulindi', 30.15, -1.965);
  const remera111 = hub(
    'REMERA_111',
    'Remera Taxi Park (route 111)',
    30.119,
    -1.959
  );
  const remera101 = hub(
    'REMERA_101',
    'Remera Taxi Park (route 101)',
    30.1191,
    -1.9591
  );
  const sonatubes = hub('SONA', 'Sonatubes', 30.095, -1.952);
  const downtown = hub('CBD', 'Downtown', 30.057, -1.943);

  const p111 = pattern('111', ['KABUGA', 'MULINDI', 'REMERA_111']);
  Object.assign(p111.stops[0], kabuga);
  Object.assign(p111.stops[1], mulindi);
  Object.assign(p111.stops[2], remera111);
  p111.headsign = 'Remera Taxi Park';

  const p101 = pattern('101', ['REMERA_101', 'SONA', 'CBD']);
  Object.assign(p101.stops[0], remera101);
  Object.assign(p101.stops[1], sonatubes);
  Object.assign(p101.stops[2], downtown);
  p101.headsign = 'CBD';

  return { patterns: [p111, p101], transfers: [] };
}

/** Kabuga → Downtown with a reviewed Remera platform transfer (internal fixture). */
export function kabugaDowntownWithTransferSnapshot(): NetworkSnapshot {
  const snap = kabugaDowntownSnapshot();
  snap.stopAreas = [
    {
      id: 'AREA_REMERA',
      name: 'Remera Taxi Park',
      aliases: ['Remera'],
      coordinates: [30.119, -1.959],
      boardingPointIds: ['REMERA_111', 'REMERA_101'],
    },
  ];
  for (const p of snap.patterns) {
    for (const s of p.stops) {
      if (s.id === 'REMERA_111' || s.id === 'REMERA_101') {
        s.stopAreaId = 'AREA_REMERA';
      }
    }
  }
  snap.transfers = [
    {
      id: randomUUID(),
      fromStopId: 'REMERA_111',
      toStopId: 'REMERA_101',
      distanceMeters: 95,
      durationSeconds: 120,
      geometry: [
        [30.119, -1.959],
        [30.1191, -1.9591],
      ],
      reviewed: true,
      source: 'internal-fixture-field-review',
    },
  ];
  snap.transfers = snap.transfers.map((t) => reviewedFixtureTransfer(snap, t));
  return snap;
}

/** Remera → Downtown: direct trunk service on route 101. */
export function remeraDowntownSnapshot(): NetworkSnapshot {
  const remera = hub('REMERA', 'Remera Taxi Park', 30.119, -1.959);
  const utc = hub('UTC', 'UTC', 30.1, -1.955);
  const sonatubes = hub('SONA', 'Sonatubes', 30.095, -1.952);
  const downtown = hub('CBD', 'Downtown', 30.057, -1.943);

  const p101 = pattern('101', ['REMERA', 'UTC', 'SONA', 'CBD']);
  Object.assign(p101.stops[0], remera);
  Object.assign(p101.stops[1], utc);
  Object.assign(p101.stops[2], sonatubes);
  Object.assign(p101.stops[3], downtown);
  p101.headsign = 'CBD';
  p101.fareRules = [
    {
      id: 'remera-cbd',
      kind: 'section',
      amount: 426,
      currency: 'RWF',
      fromStopId: 'REMERA',
      toStopId: 'CBD',
      paymentTiming: 'boarding',
      instructions: 'Pay with Tap&Go card when boarding.',
      sourceUrl: 'https://example.org/ecofleet-fares-2026',
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      verified: true,
      confidence: 'verified',
    },
  ];

  return { patterns: [p101], transfers: [] };
}

/** Kimironko → Nyabugogo: trunk via Kacyiru on route 305. */
export function kimironkoNyabugogoSnapshot(): NetworkSnapshot {
  const kimironko = hub('KIMI', 'Kimironko Taxi Park', 30.125, -1.95);
  const stadium = hub('STAD', 'Stadium', 30.11, -1.948);
  const kacyiru = hub('KACY', 'Kacyiru', 30.08, -1.945);
  const nyabugogo = hub('NYAB', 'Nyabugogo Taxi Park', 30.045, -1.941);

  const p305 = pattern('305', ['KIMI', 'STAD', 'KACY', 'NYAB']);
  Object.assign(p305.stops[0], kimironko);
  Object.assign(p305.stops[1], stadium);
  Object.assign(p305.stops[2], kacyiru);
  Object.assign(p305.stops[3], nyabugogo);
  p305.headsign = 'Nyabugogo Taxi Park';
  p305.fareRules = [
    {
      id: 'kimi-nyab',
      kind: 'section',
      amount: 300,
      currency: 'RWF',
      fromStopId: 'KIMI',
      toStopId: 'NYAB',
      paymentTiming: 'boarding',
      sourceUrl: 'https://example.org/ecofleet-fares-2026',
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      verified: true,
      confidence: 'verified',
    },
    {
      id: 'kimi-stad',
      kind: 'section',
      amount: 200,
      currency: 'RWF',
      fromStopId: 'KIMI',
      toStopId: 'STAD',
      paymentTiming: 'boarding',
      sourceUrl: 'https://example.org/ecofleet-fares-2026',
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      verified: true,
      confidence: 'verified',
    },
  ];

  return { patterns: [p305], transfers: [] };
}
