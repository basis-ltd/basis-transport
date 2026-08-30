export type PickupSource = 'geolocation' | 'search';

export interface TripLocation {
  latitude: number;
  longitude: number;
  name?: string;
  formattedAddress?: string;
  placeId?: string;
}

export interface LandingHeroFormValues {
  pickupLocation?: TripLocation;
  dropoffLocation?: TripLocation;
  pickupSource?: PickupSource;
}
