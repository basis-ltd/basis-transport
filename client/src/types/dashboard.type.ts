export interface DashboardTrip {
  id: string;
  userId: string;
  tripId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: string;
  endTime: string | null;
  trip?: {
    id: string;
    referenceId: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
    startTime: string | null;
    endTime: string | null;
  } | null;
}

export interface DailyBucket {
  day: string;
  count: number;
}

export interface CommuterSummary {
  nextTrip: DashboardTrip | null;
  tripsThisWeek: number;
  completedTrips: number;
  totalTrips: number;
  dailyVolume: DailyBucket[];
}

export interface DriverSummary {
  todaysTrips: DashboardTrip[];
  currentTrip: DashboardTrip | null;
  completedThisWeek: number;
  totalTrips: number;
}

export interface TripsByStatus {
  status: string;
  count: number;
}

export interface OverviewSummary {
  tripsByStatus: TripsByStatus[];
  activeTrips: number;
  userTripsDaily: DailyBucket[];
  signupsDaily: DailyBucket[];
  totalUsers: number;
  incompleteRegistrations: number;
  transportCards: number;
}

export interface DashboardResponse<T> {
  message: string;
  data: T;
}

export type DashboardRole = 'overview' | 'driver' | 'commuter';
