export type LandingHeroGoal = 'join' | 'signin' | 'signup' | 'how-it-works';

export interface LandingHeroTrip {
  id: string;
  referenceId: string;
  status: string;
  availableCapacity: number;
  distanceMeters?: number;
  locationFrom?: {
    name: string;
    address?: {
      coordinates?: number[];
    };
  };
  locationTo?: {
    name: string;
  };
}
