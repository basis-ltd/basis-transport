import { fareForRide, quoteJourneyFares } from './fare-engine';
import { rideLeg } from './journey-engine';
import { pattern } from './network.fixtures';
import type { NetworkPattern, FareRule } from './network.types';

describe('Fare engine', () => {
  it('applies a transfer adjustment only to its explicit route pair, once per eligible change', () => {
    const a = pattern('101', ['A', 'B']),
      b = pattern('202', ['B', 'C']),
      c = pattern('303', ['C', 'D']);
    for (const p of [a, b, c])
      p.fare = {
        amount: 250,
        currency: 'RWF',
        sourceUrl: 'https://example.org/fare',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        verified: true,
      };
    const fare: FareRule = {
      id: 'transfer',
      kind: 'transfer_discount',
      fromRouteId: '101',
      toRouteId: '202',
      amount: 50,
      currency: 'RWF',
      sourceUrl: 'https://example.org/fare',
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      verified: true,
      confidence: 'verified',
      paymentTiming: 'boarding',
    };
    const rides = [a, b, c].map((p) => rideLeg(p, 0, 1));
    const patterns = new Map([a, b, c].map((p) => [p.id, p]));
    const quote = quoteJourneyFares(rides, patterns, [fare], '2026-08-30');
    expect(quote.total).toBe(700);
    expect(quote.transferAdjustments).toHaveLength(1);
    expect(
      quoteJourneyFares(rides.slice(1), patterns, [fare], '2026-08-30').total
    ).toBe(500);
    const unscoped = { ...fare, fromRouteId: undefined };
    expect(
      quoteJourneyFares(rides, patterns, [unscoped], '2026-08-30')
    ).toMatchObject({ status: 'partial', total: null, subtotal: 750 });
    expect(
      quoteJourneyFares(
        rides,
        patterns,
        [fare, { ...fare, amount: 100 }],
        '2026-08-30'
      ).total
    ).toBeNull();
    expect(
      quoteJourneyFares(
        rides,
        patterns,
        [{ ...fare, validTo: '2026-01-02' }],
        '2026-08-30'
      ).total
    ).toBeNull();
    expect(
      quoteJourneyFares(
        rides,
        patterns,
        [{ ...fare, amount: 1000 }],
        '2026-08-30'
      ).total
    ).toBeNull();
  });
  it('fails closed on genuinely conflicting active fare rules', () => {
    const p = pattern('101', ['A', 'B']);
    p.fareRules = [300, 400].map((amount) => ({
      id: String(amount),
      kind: 'fixed',
      amount,
      currency: 'RWF',
      paymentTiming: 'boarding',
      sourceUrl: 'https://example.org/fare',
      validFrom: '2020-01-01',
      validTo: '2099-01-01',
      verified: true,
      confidence: 'verified',
    }));
    expect(fareForRide(p, p.stops[0], p.stops[1])).toBeNull();
  });
  it('quotes the requested fare date, not the server clock, and preserves a partial subtotal', () => {
    const p = pattern('101', ['A', 'B']),
      other = pattern('202', ['B', 'C']);
    p.fare = {
      amount: 250,
      currency: 'RWF',
      sourceUrl: 'https://example.org/fare',
      validFrom: '2035-01-01',
      validTo: '2035-12-31',
      verified: true,
    };
    const quote = quoteJourneyFares(
      [rideLeg(p, 0, 1), rideLeg(other, 0, 1)],
      new Map([
        [p.id, p],
        [other.id, other],
      ]),
      [],
      '2035-02-01'
    );
    expect(quote).toMatchObject({
      status: 'partial',
      subtotal: 250,
      total: null,
    });
    expect(fareForRide(p, p.stops[0], p.stops[1], '2034-12-31')).toBeNull();
  });
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kigali',
  }).format(new Date());

  it('applies different section fares on the same route', () => {
    const p = pattern('302', ['A', 'B', 'C', 'D']);
    p.fareRules = [
      {
        id: 'ab',
        kind: 'section',
        amount: 200,
        currency: 'RWF',
        fromStopId: 'A',
        toStopId: 'B',
        paymentTiming: 'boarding',
        sourceUrl: 'https://example.org/fares',
        validFrom: '2019-01-01',
        validTo: '2030-12-31',
        verified: true,
        confidence: 'verified',
      },
      {
        id: 'cd',
        kind: 'section',
        amount: 350,
        currency: 'RWF',
        fromStopId: 'C',
        toStopId: 'D',
        paymentTiming: 'boarding',
        sourceUrl: 'https://example.org/fares',
        validFrom: '2019-01-01',
        validTo: '2030-12-31',
        verified: true,
        confidence: 'verified',
      },
    ];

    const short = fareForRide(p, p.stops[0], p.stops[1]);
    const long = fareForRide(p, p.stops[2], p.stops[3]);
    expect(short?.amount).toBe(200);
    expect(long?.amount).toBe(350);

    const ride1 = rideLeg(p, 0, 1);
    const ride2 = rideLeg(p, 2, 3);
    const quote = quoteJourneyFares([ride1, ride2], new Map([[p.id, p]]));
    expect(quote.status).toBe('known');
    expect(quote.total).toBe(550);
  });

  it('returns unknown when stale or conflicting rules cannot produce a definitive quote', () => {
    const p = pattern('101', ['A', 'B', 'C']);
    p.fareRules = [
      {
        id: 'expired',
        kind: 'fixed',
        amount: 300,
        currency: 'RWF',
        paymentTiming: 'boarding',
        sourceUrl: 'https://example.org/fares',
        validFrom: '2019-01-01',
        validTo: '2020-01-01',
        verified: true,
        confidence: 'verified',
      },
    ];
    expect(fareForRide(p, p.stops[0], p.stops[2])).toBeNull();

    p.fareRules = [
      {
        id: 'unverified',
        kind: 'fixed',
        amount: 300,
        currency: 'RWF',
        paymentTiming: 'boarding',
        sourceUrl: 'https://example.org/fares',
        validFrom: '2019-01-01',
        validTo: '2030-12-31',
        verified: false,
        confidence: 'unknown',
      },
    ];
    expect(fareForRide(p, p.stops[0], p.stops[2])).toBeNull();

    const ride = rideLeg(p, 0, 2);
    const quote = quoteJourneyFares([ride], new Map([[p.id, p]]));
    expect(quote.status).toBe('unknown');
    expect(quote.total).toBeNull();
  });

  it('never treats unknown fare as zero in ranking totals', () => {
    const p = pattern('101', ['A', 'B']);
    p.fare = {
      amount: 250,
      currency: 'RWF',
      sourceUrl: 'https://example.org/fares',
      validFrom: '2019-01-01',
      validTo: '2030-12-31',
      verified: true,
    };
    const withFare = quoteJourneyFares(
      [rideLeg(p, 0, 1)],
      new Map([[p.id, p]])
    );
    p.fare = null;
    const withoutFare = quoteJourneyFares(
      [rideLeg(p, 0, 1)],
      new Map([[p.id, p]])
    );
    expect(withFare.total).toBe(250);
    expect(withoutFare.total).toBeNull();
    expect(withoutFare.status).toBe('unknown');
  });
});
