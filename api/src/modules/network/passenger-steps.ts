import { createHash } from 'crypto';
import type { FareQuote, Journey, RideLeg, WalkLeg } from './network.types';
import { quoteJourneyFares } from './fare-engine';
import type { FareRule } from './network.types';
import type { NetworkPattern } from './network.types';

export type PassengerStepKind =
  'walk' | 'wait' | 'board' | 'ride' | 'alight' | 'transfer' | 'arrive';

export type StepConfidence = 'verified' | 'estimated' | 'unknown';

export interface StepTiming {
  status: 'scheduled' | 'estimated' | 'unknown';
  seconds: number | null;
  label: string | null;
}

export interface PassengerStep {
  id: string;
  kind: PassengerStepKind;
  legIndex: number | null;
  location?: { name: string; stopId?: string };
  text: string;
  confidence: StepConfidence;
  timing: StepTiming;
  fareAmount: number | null;
  fareCurrency: 'RWF' | null;
  paymentTiming: 'boarding' | 'alighting' | 'other' | null;
  paymentInstructions: string | null;
}

function stepId(parts: unknown[]): string {
  return createHash('sha256')
    .update(JSON.stringify(parts))
    .digest('hex')
    .slice(0, 12);
}

function fareForLeg(
  fareQuote: FareQuote | undefined,
  legIndex: number
): {
  amount: number | null;
  paymentTiming: PassengerStep['paymentTiming'];
  instructions: string | null;
} {
  const leg = fareQuote?.legFares.find((f) => f.legIndex === legIndex);
  return {
    amount: leg?.amount ?? null,
    paymentTiming: leg?.paymentTiming ?? null,
    instructions: leg?.instructions ?? null,
  };
}

function walkConfidence(leg: WalkLeg): StepConfidence {
  if (leg.quality === 'reviewed-transfer') return 'verified';
  if (leg.quality === 'pedestrian-route') return 'estimated';
  return 'unknown';
}

function rideTiming(leg: RideLeg): StepTiming {
  if (leg.timing?.status === 'scheduled')
    return {
      status: 'scheduled',
      seconds: leg.durationSeconds,
      label: `Timetable · ${leg.timing.serviceDate} · ${leg.timing.timezone}`,
    };
  if (leg.durationSeconds !== null)
    return {
      status: 'estimated',
      seconds: leg.durationSeconds,
      label: 'Source schedule estimate',
    };
  return { status: 'unknown', seconds: null, label: null };
}

export function buildPassengerSteps(
  journey: Journey,
  fareQuote?: FareQuote
): PassengerStep[] {
  const steps: PassengerStep[] = [];
  let legIndex = 0;

  for (const leg of journey.legs) {
    if (leg.kind === 'walk') {
      const isTransfer =
        leg.quality === 'reviewed-transfer' &&
        steps.length > 0 &&
        steps[steps.length - 1].kind === 'alight';

      if (isTransfer) {
        steps.push({
          id: stepId(['transfer', legIndex, leg.to.stopId]),
          kind: 'transfer',
          legIndex,
          location: { name: leg.to.name, stopId: leg.to.stopId },
          text:
            leg.instructions[0] ||
            `Walk to ${leg.to.name} to change buses (${leg.distanceMeters} m).`,
          confidence: walkConfidence(leg),
          timing: {
            status: leg.durationSeconds === null ? 'unknown' : 'estimated',
            seconds: leg.durationSeconds,
            label:
              leg.quality === 'unverified-access'
                ? 'Walking path not checked'
                : 'Pedestrian route estimate',
          },
          fareAmount: null,
          fareCurrency: null,
          paymentTiming: null,
          paymentInstructions: null,
        });
      } else {
        steps.push({
          id: stepId(['walk', legIndex, leg.to.stopId]),
          kind: 'walk',
          legIndex,
          location: { name: leg.to.name, stopId: leg.to.stopId },
          text:
            leg.instructions[0] ||
            `Walk to ${leg.to.name} (${leg.distanceMeters} m).`,
          confidence: walkConfidence(leg),
          timing: {
            status: leg.durationSeconds === null ? 'unknown' : 'estimated',
            seconds: leg.durationSeconds,
            label:
              leg.quality === 'unverified-access'
                ? 'Walking path not checked'
                : 'Pedestrian route estimate',
          },
          fareAmount: null,
          fareCurrency: null,
          paymentTiming: null,
          paymentInstructions: null,
        });
      }
      legIndex++;
      continue;
    }

    const ride = leg;
    const fare = fareForLeg(fareQuote, legIndex);
    const scheduled = ride.timing?.status === 'scheduled';
    const waitText = `Wait at ${ride.board.name} for route ${ride.routeNumber} towards ${ride.headsign}. ${scheduled ? 'Timetable departure; actual arrival may differ.' : 'Service timing is unknown.'}`;

    steps.push({
      id: stepId(['wait', legIndex, ride.board.id]),
      kind: 'wait',
      legIndex,
      location: { name: ride.board.name, stopId: ride.board.id },
      text: waitText,
      confidence: scheduled ? 'verified' : 'unknown',
      timing: scheduled
        ? {
            status: 'scheduled',
            seconds: ride.timing!.waitSeconds,
            label: `Timetable · ${ride.timing!.serviceDate} · ${ride.timing!.timezone}`,
          }
        : { status: 'unknown', seconds: null, label: null },
      fareAmount: null,
      fareCurrency: null,
      paymentTiming: null,
      paymentInstructions: null,
    });

    const boardFare = fare.paymentTiming === 'boarding' ? fare.amount : null;
    const boardPayment =
      fare.paymentTiming === 'boarding'
        ? fare.instructions ||
          (fare.amount !== null
            ? `Pay ${fare.amount.toLocaleString()} RWF when boarding.`
            : 'Fare unknown — confirm with the conductor.')
        : null;

    steps.push({
      id: stepId(['board', legIndex, ride.board.id]),
      kind: 'board',
      legIndex,
      location: { name: ride.board.name, stopId: ride.board.id },
      text: `Board route ${ride.routeNumber} (${ride.agency}) towards ${ride.headsign}.`,
      confidence: 'unknown',
      timing: { status: 'unknown', seconds: null, label: null },
      fareAmount: boardFare,
      fareCurrency: boardFare !== null ? 'RWF' : null,
      paymentTiming: fare.paymentTiming,
      paymentInstructions:
        boardPayment ||
        (fare.paymentTiming === 'other'
          ? fare.instructions || 'Confirm how to pay before boarding.'
          : fare.amount === null
            ? 'Fare unknown — confirm before boarding.'
            : null),
    });

    steps.push({
      id: stepId(['ride', legIndex, ride.patternId]),
      kind: 'ride',
      legIndex,
      location: { name: ride.headsign },
      text: `Ride route ${ride.routeNumber} for ${ride.stops.length - 1} stops (${ride.distanceMeters} m).`,
      confidence: 'estimated',
      timing: rideTiming(ride),
      fareAmount: null,
      fareCurrency: null,
      paymentTiming: null,
      paymentInstructions: null,
    });

    const alightFare = fare.paymentTiming === 'alighting' ? fare.amount : null;
    const alightPayment =
      fare.paymentTiming === 'alighting'
        ? fare.instructions ||
          (fare.amount !== null
            ? `Pay ${fare.amount.toLocaleString()} RWF when alighting.`
            : 'Fare unknown — confirm with the conductor.')
        : null;

    steps.push({
      id: stepId(['alight', legIndex, ride.alight.id, ride.alight.sequence]),
      kind: 'alight',
      legIndex,
      location: { name: ride.alight.name, stopId: ride.alight.id },
      text: `Get off at ${ride.alight.name} (stop ${ride.alight.sequence + 1} on this trip).`,
      confidence: 'unknown',
      timing: { status: 'unknown', seconds: null, label: null },
      fareAmount: alightFare,
      fareCurrency: alightFare !== null ? 'RWF' : null,
      paymentTiming: fare.paymentTiming,
      paymentInstructions: alightPayment,
    });

    legIndex++;
  }

  const lastLeg = journey.legs[journey.legs.length - 1];
  const arriveName =
    lastLeg?.kind === 'walk'
      ? lastLeg.to.name
      : lastLeg?.kind === 'ride'
        ? lastLeg.alight.name
        : 'your destination';

  steps.push({
    id: stepId(['arrive', arriveName]),
    kind: 'arrive',
    legIndex: null,
    location: { name: arriveName },
    text: `Arrive at ${arriveName}.`,
    confidence: 'verified',
    timing: { status: 'unknown', seconds: null, label: null },
    fareAmount: null,
    fareCurrency: null,
    paymentTiming: null,
    paymentInstructions: null,
  });

  return steps;
}

export function enrichJourney(
  journey: Journey,
  patterns: NetworkPattern[],
  transferRules: FareRule[] = [],
  fareDate?: string
): Journey {
  const rides = journey.legs.filter((l): l is RideLeg => l.kind === 'ride');
  const patternMap = new Map(patterns.map((p) => [p.id, p]));
  const fareQuote = quoteJourneyFares(
    rides,
    patternMap,
    transferRules,
    fareDate,
    journey.legs.flatMap((leg, index) => (leg.kind === 'ride' ? [index] : []))
  );
  const steps = buildPassengerSteps(journey, fareQuote);

  return {
    ...journey,
    steps,
    fareQuote,
    fareRwf: fareQuote.total,
  };
}
