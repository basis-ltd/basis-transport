export type Coordinates = [number, number]; // GeoJSON longitude, latitude
export type Verification = 'historic' | 'unverified' | 'verified';
// Source references identify original records; they are not verification claims.
export interface SourceRecord {
  namespace: string;
  file: 'stops.txt' | 'routes.txt' | 'trips.txt' | 'stop_times.txt';
  recordId: string;
  recordSubId?: string;
}
export interface ImportProvenance {
  namespace: string;
  sourceUrl: string;
  checksum: string;
  importedAt: string;
  retrievedAt: string | null;
  feedVersion?: string;
  feedLanguage?: string;
}
export interface NetworkStop {
  id: string;
  code: string;
  name: string;
  aliases: string[];
  coordinates: Coordinates;
  stopAreaId?: string;
  displayNames?: Record<string, string>;
  zoneId?: string;
  platformCode?: string;
  sourceRecord?: SourceRecord;
}
export interface StopArea {
  id: string;
  name: string;
  aliases: string[];
  coordinates: Coordinates;
  boardingPointIds: string[];
  displayNames?: Record<string, string>;
  sourceRecord?: SourceRecord;
}
export interface PatternStop extends NetworkStop {
  stopTimeRecord?: SourceRecord;
  sequence: number;
  sourceSequence: number;
  elapsedSeconds: number | null;
  departureElapsedSeconds?: number | null;
  shapeIndex: number | null;
}
export interface ServiceWindow {
  startSeconds: number;
  endSeconds: number;
  headwaySeconds: number;
}
export interface PatternService {
  sourceId: string;
  validFrom: string;
  validTo: string;
  weekdays: boolean[]; // Monday first
  exceptions: { date: string; added: boolean }[];
  windows: ServiceWindow[];
  timezone?: string;
  // Absolute service-day starts plus relative stop offsets, never inferred from headways.
  timetable?: { departures: number[]; verified: boolean; sourceUrl: string };
}
export interface Fare {
  amount: number;
  currency: 'RWF';
  sourceUrl: string;
  validFrom: string;
  validTo: string;
  verified: boolean;
}
export type FareRuleKind =
  'fixed' | 'section' | 'zone' | 'transfer_discount' | 'transfer_charge';
export type PaymentTiming = 'boarding' | 'alighting' | 'other';
export type FareConfidence = 'verified' | 'estimated' | 'unknown';
export interface FareRule {
  id: string;
  kind: FareRuleKind;
  amount: number;
  currency: 'RWF';
  fromStopId?: string;
  toStopId?: string;
  fromSequence?: number;
  toSequence?: number;
  fromZoneId?: string;
  toZoneId?: string;
  fromRouteId?: string;
  toRouteId?: string;
  containsZoneIds?: string[];
  paymentTiming: PaymentTiming;
  paymentMethods?: string[];
  instructions?: string;
  sourceUrl: string;
  validFrom: string;
  validTo: string;
  verified: boolean;
  confidence: FareConfidence;
}
export interface LegFare {
  legIndex: number;
  amount: number | null;
  rule: FareRule | null;
  paymentTiming: PaymentTiming | null;
  instructions: string | null;
}
export interface TransferAdjustment {
  amount: number;
  description: string;
  rule: FareRule | null;
}
export interface FareQuote {
  status: 'known' | 'partial' | 'unknown';
  legFares: LegFare[];
  transferAdjustments: TransferAdjustment[];
  subtotal: number | null;
  total: number | null;
  warnings?: string[];
}
export interface NetworkPattern {
  sourceRecord?: SourceRecord;
  routeSourceRecord?: SourceRecord;
  id: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  agency: string;
  sourceTripId: string;
  sourceShapeId: string | null;
  direction: string;
  headsign: string;
  stops: PatternStop[];
  geometry: Coordinates[] | null;
  service: PatternService;
  fare: Fare | null;
  fareRules?: FareRule[];
  enabled: boolean;
}
export interface TransferLink {
  id: string;
  fromStopId: string;
  toStopId: string;
  distanceMeters: number | null;
  durationSeconds: number | null;
  geometry: Coordinates[];
  reviewed: boolean;
  source: string;
  pathKind?: 'surveyed' | 'pedestrian-provider' | 'unknown';
  instructions?: string[];
  review?: {
    reviewerId: string;
    reviewedAt: string;
    evidenceUrl: string;
    notes: string;
    contentHash: string;
  };
}
export interface NetworkSnapshot {
  importProvenance?: ImportProvenance;
  patterns: NetworkPattern[];
  transfers: TransferLink[];
  fareRules?: FareRule[];
  stopAreas?: StopArea[];
}
export interface QualityIssue {
  reference: string;
  message: string;
  severity: 'warning' | 'error';
}
export interface SearchOptions {
  maxTransfers: number;
  preference: 'fewest_transfers' | 'least_walking';
  departureAt?: string;
  allowScheduled?: boolean;
  // Internal computation bounds, not passenger-supplied API options.
  limits?: { expansions?: number; frontier?: number; labelsPerState?: number };
}
export interface JourneyLocation {
  stopId?: string;
  latitude?: number;
  longitude?: number;
}
export interface ResolvedLocation {
  stopId?: string;
  name: string;
  coordinates: Coordinates;
}
export interface WalkLeg {
  kind: 'walk';
  from: ResolvedLocation;
  to: ResolvedLocation;
  distanceMeters: number;
  durationSeconds: number;
  geometry: Coordinates[];
  instructions: string[];
  quality: 'pedestrian-route' | 'reviewed-transfer';
}
export interface RideLeg {
  kind: 'ride';
  patternId: string;
  routeId: string;
  routeNumber: string;
  agency: string;
  headsign: string;
  board: PatternStop;
  alight: PatternStop;
  stops: PatternStop[];
  distanceMeters: number;
  durationSeconds: number | null;
  geometry: Coordinates[];
  geometryQuality: 'source-shape' | 'schematic';
  fare: Fare | null;
  timing?: {
    status: 'scheduled' | 'unknown';
    departureAt: string | null;
    arrivalAt: string | null;
    waitSeconds: number | null;
    serviceDate: string | null;
    timezone: string | null;
    sourceUrl: string | null;
  };
}
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
  paymentTiming: PaymentTiming | null;
  paymentInstructions: string | null;
}
export interface Journey {
  id: string;
  legs: (WalkLeg | RideLeg)[];
  steps?: PassengerStep[];
  transfers: number;
  walkingMeters: number;
  ridingMeters: number;
  durationSeconds: number | null;
  fareRwf: number | null;
  fareQuote?: FareQuote;
  timingStatus?: 'scheduled' | 'estimated' | 'unknown';
  arrivalAt?: string | null;
}
export type JourneyPlanStatus =
  | 'ok'
  | 'walking_only'
  | 'already_at_destination'
  | 'no_connection'
  | 'outside_coverage'
  | 'no_service_at_time'
  | 'service_timing_unknown'
  | 'provider_unavailable'
  | 'search_limit_reached';
export interface NearbyStopConnection {
  origin: ResolvedLocation;
  destination: ResolvedLocation;
  originDistanceMeters: number;
  destinationDistanceMeters: number;
  routeNumber: string;
  headsign: string;
}
export interface JourneyPlan {
  validFrom: string | null;
  validTo: string | null;
  departureAt?: string | null;
  status: JourneyPlanStatus;
  datasetVersion: string;
  verification: Verification;
  sourceUrl: string;
  origin: ResolvedLocation;
  destination: ResolvedLocation;
  journeys: Journey[];
  nearbyConnections?: NearbyStopConnection[];
  warnings: string[];
}
