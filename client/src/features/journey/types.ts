export type Coordinates = [number, number];
export interface JourneyLocation {
  stopId?: string;
  latitude: number;
  longitude: number;
  name: string;
  placeId?: string;
}
export interface NetworkStop {
  id: string;
  code: string;
  name: string;
  aliases: string[];
  coordinates: Coordinates;
  distanceMeters?: number;
  routeNumbers?: string[];
  services?: { routeNumber: string; headsign: string }[];
  directConnection?: boolean;
  terminalArea?: boolean;
  boardingPointCount?: number;
  platformCode?: string;
  displayNames?: Record<string, string>;
  sourceRecord?: { namespace: string; file: string; recordId: string };
}
export interface PatternStop extends NetworkStop {
  sequence: number;
  sourceSequence: number;
  elapsedSeconds: number | null;
  shapeIndex: number | null;
}
export interface NetworkMetadata {
  version: string;
  source: string;
  sourceUrl: string;
  verification: "historic" | "unverified" | "verified";
  rightsStatus: string;
  validFrom: string | null;
  validTo: string | null;
}
export interface NetworkStatus extends Partial<NetworkMetadata> {
  ready: boolean;
  mode: string;
  routes: number;
  stops: number;
  patterns: number;
  walkingAvailable: boolean;
  notice: string;
}
export interface RouteSummary {
  id: string;
  shortName: string;
  longName: string;
  agency: string;
  patterns: number;
}
export interface Fare {
  amount: number;
  currency: "RWF";
  sourceUrl: string;
  validFrom: string;
  validTo: string;
  verified: boolean;
}
export interface NetworkMapPattern {
  id: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  agency: string;
  direction: string;
  headsign: string;
  geometry: Coordinates[];
  geometryQuality: "source-shape" | "schematic";
  generalized: boolean;
  stops: Pick<
    PatternStop,
    "id" | "code" | "name" | "coordinates" | "sequence"
  >[];
  stopCount: number;
  stopsTruncated: boolean;
}
export interface NetworkMapData {
  patterns: NetworkMapPattern[];
  totalPatterns: number;
  totalRoutes: number;
  truncated: boolean;
  network: NetworkMetadata;
  filters: {
    routes: { id: string; number: string; name: string }[];
    routesTruncated: boolean;
    agencies: string[];
    headsigns: string[];
  };
}
export interface Pattern {
  id: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  agency: string;
  headsign: string;
  direction: string;
  sourceTripId: string;
  sourceShapeId: string | null;
  stops: PatternStop[];
  geometry: Coordinates[] | null;
  enabled: boolean;
  fare: Fare | null;
  service: {
    sourceId: string;
    validFrom: string;
    validTo: string;
    weekdays: boolean[];
    exceptions: { date: string; added: boolean }[];
    windows: {
      startSeconds: number;
      endSeconds: number;
      headwaySeconds: number;
    }[];
  };
}
export interface RouteDetail extends Omit<RouteSummary, "patterns"> {
  patterns: Pattern[];
  network: NetworkMetadata;
}
export interface StopDetail extends NetworkStop {
  routes: RouteSummary[];
  stopArea?: {
    id: string;
    name: string;
    boardingPoints: { id: string; name: string; code: string }[];
  } | null;
  network: NetworkMetadata;
}
export interface Page<T> {
  rows: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  network: NetworkMetadata;
  filters?: {
    agencies: string[];
    headsigns: string[];
  };
}
export interface ResolvedLocation {
  name: string;
  coordinates: Coordinates;
  stopId?: string;
}
export interface WalkLeg {
  kind: "walk";
  from: ResolvedLocation;
  to: ResolvedLocation;
  distanceMeters: number;
  durationSeconds: number;
  geometry: Coordinates[];
  instructions: string[];
  quality: string;
}
export interface RideLeg {
  kind: "ride";
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
  geometryQuality: "source-shape" | "schematic";
  fare: Fare | null;
}
export interface FareQuote {
  status: "known" | "partial" | "unknown";
  legFares: {
    legIndex: number;
    amount: number | null;
    paymentTiming: string | null;
    instructions: string | null;
  }[];
  transferAdjustments: { amount: number; description: string }[];
  subtotal: number | null;
  total: number | null;
  warnings?: string[];
}
export type PassengerStepKind =
  "walk" | "wait" | "board" | "ride" | "alight" | "transfer" | "arrive";
export interface PassengerStep {
  id: string;
  kind: PassengerStepKind;
  legIndex: number | null;
  location?: { name: string; stopId?: string };
  text: string;
  confidence: "verified" | "estimated" | "unknown";
  timing: {
    status: "scheduled" | "estimated" | "unknown";
    seconds: number | null;
    label: string | null;
  };
  fareAmount: number | null;
  fareCurrency: "RWF" | null;
  paymentTiming: "boarding" | "alighting" | "other" | null;
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
  timingStatus?: "scheduled" | "estimated" | "unknown";
  arrivalAt?: string | null;
}
export type JourneyPlanStatus =
  | "ok"
  | "walking_only"
  | "already_at_destination"
  | "no_connection"
  | "outside_coverage"
  | "no_service_at_time"
  | "service_timing_unknown"
  | "provider_unavailable"
  | "search_limit_reached";
export interface JourneyPlan {
  validFrom: string | null;
  validTo: string | null;
  departureAt?: string | null;
  status: JourneyPlanStatus;
  datasetVersion: string;
  verification: NetworkMetadata["verification"];
  sourceUrl: string;
  origin: ResolvedLocation;
  destination: ResolvedLocation;
  journeys: Journey[];
  nearbyConnections?: {
    origin: ResolvedLocation;
    destination: ResolvedLocation;
    originDistanceMeters: number;
    destinationDistanceMeters: number;
    routeNumber: string;
    headsign: string;
  }[];
  warnings: string[];
}
export interface SavedItem {
  id?: string;
  key: string;
  label: string;
  href: string;
  kind: "journey" | "stop" | "route";
}
export interface Dataset extends NetworkMetadata {
  snapshotRevision?: string;
  id: string;
  status: "draft" | "published" | "archived";
  checksum: string;
  rightsEvidence: string;
  verificationEvidence: string;
  importedAt: string;
  issues: { reference: string; message: string; severity: string }[];
  snapshot: { patterns: Pattern[]; transfers: unknown[] };
  patternCount?: number;
}
export interface PassengerReport {
  id: string;
  kind: string;
  referenceId: string | null;
  message: string;
  email: string | null;
  name: string | null;
  status: "open" | "resolved";
  createdAt: string;
}
