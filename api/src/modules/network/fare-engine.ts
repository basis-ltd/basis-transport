import type {
  Fare,
  FareQuote,
  FareRule,
  LegFare,
  NetworkPattern,
  PatternStop,
  RideLeg,
  TransferAdjustment,
} from './network.types';

export type { FareRule, FareQuote, LegFare, TransferAdjustment };

const todayKigali = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Kigali' }).format(
    new Date()
  );

function isActive(rule: FareRule | Fare, today: string): boolean {
  return (
    rule.verified &&
    rule.validFrom <= today &&
    rule.validTo >= today &&
    ('confidence' in rule ? rule.confidence === 'verified' : true)
  );
}

function fixedRuleFromPattern(fare: Fare): FareRule {
  return {
    id: 'pattern-fixed',
    kind: 'fixed',
    amount: fare.amount,
    currency: fare.currency,
    paymentTiming: 'boarding',
    sourceUrl: fare.sourceUrl,
    validFrom: fare.validFrom,
    validTo: fare.validTo,
    verified: fare.verified,
    confidence: 'verified',
  };
}

function sectionRuleMatches(
  rule: FareRule,
  board: PatternStop,
  alight: PatternStop
): boolean {
  if (rule.kind !== 'section') return false;
  if (rule.fromStopId && rule.fromStopId !== board.id) return false;
  if (rule.toStopId && rule.toStopId !== alight.id) return false;
  if (rule.fromSequence !== undefined && rule.fromSequence !== board.sequence)
    return false;
  if (rule.toSequence !== undefined && rule.toSequence !== alight.sequence)
    return false;
  return true;
}

export function fareRulesForPattern(pattern: NetworkPattern): FareRule[] {
  const rules: FareRule[] = [];
  if (pattern.fareRules?.length) rules.push(...pattern.fareRules);
  else if (pattern.fare) rules.push(fixedRuleFromPattern(pattern.fare));
  return rules;
}

export function fareForRide(
  pattern: NetworkPattern,
  board: PatternStop,
  alight: PatternStop,
  today = todayKigali()
): FareRule | null {
  const rules = fareRulesForPattern(pattern).filter((r) => isActive(r, today));
  if (!rules.length) return null;

  const section = rules.filter(
    (r) =>
      sectionRuleMatches(r, board, alight) ||
      (r.kind === 'zone' &&
        (!r.fromZoneId || r.fromZoneId === board.zoneId) &&
        (!r.toZoneId || r.toZoneId === alight.zoneId) &&
        (!r.containsZoneIds?.length ||
          r.containsZoneIds.every((zone) =>
            pattern.stops
              .slice(board.sequence, alight.sequence + 1)
              .some((s) => s.zoneId === zone)
          )))
  );
  const applicable = section.length
    ? section
    : rules.filter((r) => r.kind === 'fixed');
  // Conflicting equally applicable evidence must never be resolved by array order.
  const signatures = new Set(
    applicable.map((r) =>
      JSON.stringify([
        r.amount,
        r.currency,
        r.paymentTiming,
        r.paymentMethods,
        r.instructions,
        r.confidence,
      ])
    )
  );
  if (signatures.size === 1) return applicable[0];

  return null;
}

export function quoteJourneyFares(
  rides: RideLeg[],
  patterns: Map<string, NetworkPattern>,
  transferRules: FareRule[] = [],
  today = todayKigali(),
  physicalLegIndices = rides.map((_, index) => index)
): FareQuote {
  const legFares: LegFare[] = rides.map((ride, legIndex) => {
    const pattern = patterns.get(ride.patternId);
    const rule = pattern
      ? fareForRide(pattern, ride.board, ride.alight, today)
      : ride.fare && isActive(ride.fare, today)
        ? fixedRuleFromPattern(ride.fare)
        : null;
    return {
      legIndex: physicalLegIndices[legIndex],
      amount: rule?.amount ?? null,
      rule,
      paymentTiming: rule?.paymentTiming ?? null,
      instructions: rule?.instructions ?? null,
    };
  });

  const transferAdjustments: TransferAdjustment[] = [];
  const warnings: string[] = [];
  let unknownAdjustment = false;
  for (let index = 1; index < rides.length; index++) {
    const before = rides[index - 1],
      after = rides[index];
    const candidates = transferRules.filter(
      (r) =>
        (!r.fromRouteId || r.fromRouteId === before.routeId) &&
        (!r.toRouteId || r.toRouteId === after.routeId) &&
        (!r.fromStopId || r.fromStopId === before.alight.id) &&
        (!r.toStopId || r.toStopId === after.board.id)
    );
    if (!candidates.length) continue;
    const signatures = new Set(
      candidates.map((r) =>
        JSON.stringify([
          r.kind,
          r.amount,
          r.currency,
          r.paymentTiming,
          r.instructions,
          r.paymentMethods,
        ])
      )
    );
    if (
      signatures.size !== 1 ||
      candidates.some(
        (r) =>
          !r.fromRouteId ||
          !r.toRouteId ||
          !isActive(r, today) ||
          !['transfer_discount', 'transfer_charge'].includes(r.kind)
      )
    ) {
      unknownAdjustment = true;
      warnings.push(
        'A transfer charge or discount has incomplete, stale or conflicting eligibility evidence. The total fare is unknown.'
      );
      continue;
    }
    const rule = candidates[0];
    transferAdjustments.push({
      amount:
        rule.kind === 'transfer_discount'
          ? -Math.abs(rule.amount)
          : rule.amount,
      description:
        rule.instructions ||
        (rule.kind === 'transfer_discount'
          ? 'Transfer discount'
          : 'Transfer charge'),
      rule,
    });
  }

  const knownLegs = legFares.filter((l) => l.amount !== null);
  const legSubtotal =
    knownLegs.length || !rides.length
      ? knownLegs.reduce((sum, l) => sum + l.amount!, 0)
      : null;

  const adjustmentTotal = transferAdjustments.reduce(
    (sum, a) => sum + a.amount,
    0
  );

  if (legSubtotal !== null && legSubtotal + adjustmentTotal < 0) {
    unknownAdjustment = true;
    warnings.push(
      'The supplied transfer discount exceeds the known fare. Confirm the fare rules; no free journey is inferred.'
    );
  }
  const hasUnknownLeg =
    legFares.some((l) => l.amount === null) || unknownAdjustment;
  const status: FareQuote['status'] = hasUnknownLeg
    ? knownLegs.length
      ? 'partial'
      : 'unknown'
    : 'known';

  const total =
    status === 'known' && legSubtotal !== null
      ? Math.max(0, legSubtotal + adjustmentTotal)
      : null;

  return {
    status,
    legFares,
    transferAdjustments,
    subtotal: legSubtotal,
    total,
    warnings: [...new Set(warnings)],
  };
}
