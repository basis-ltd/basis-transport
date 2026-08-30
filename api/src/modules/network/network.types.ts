export type Coordinates = [number, number]; // GeoJSON longitude, latitude
export type Verification = 'historic' | 'unverified' | 'verified';
export interface NetworkStop {
  id: string;
  code: string;
  name: string;
  aliases: string[];
  coordinates: Coordinates;
}
export interface PatternStop extends NetworkStop {
  sequence: number;
  sourceSequence: number;
  elapsedSeconds: number | null;
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
}
export interface Fare {
  amount: number;
  currency: 'RWF';
  sourceUrl: string;
  validFrom: string;
  validTo: string;
  verified: boolean;
}
export interface NetworkPattern {
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
  enabled: boolean;
}
export interface TransferLink {
  id: string;
  fromStopId: string;
  toStopId: string;
  distanceMeters: number;
  durationSeconds: number;
  geometry: Coordinates[];
  reviewed: boolean;
  source: string;
}
export interface NetworkSnapshot {
  patterns: NetworkPattern[];
  transfers: TransferLink[];
}
export interface QualityIssue {
  reference: string;
  message: string;
  severity: 'warning' | 'error';
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
}
export interface Journey {
  id: string;
  legs: (WalkLeg | RideLeg)[];
  transfers: number;
  walkingMeters: number;
  ridingMeters: number;
  durationSeconds: number | null;
  fareRwf: number | null;
}
export interface JourneyPlan {
  validFrom: string | null;
  validTo: string | null;
  status: 'ok' | 'no_connection' | 'outside_coverage' | 'provider_unavailable';
  datasetVersion: string;
  verification: Verification;
  sourceUrl: string;
  origin: ResolvedLocation;
  destination: ResolvedLocation;
  journeys: Journey[];
  warnings: string[];
}
