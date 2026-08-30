export interface TravelRouteTrip {
  id: string;
  referenceId: string;
  status: string;
  availableCapacity: number;
  totalCapacity?: number;
  startTime?: string | null;
  distanceMeters?: number;
  locationFrom?: {
    name: string;
  };
  locationTo?: {
    name: string;
  };
}

const normalizeLocationText = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

export const matchesLocationQuery = (locationName: string | undefined, query: string) => {
  if (!locationName || !query.trim()) {
    return false;
  }

  const normalizedName = normalizeLocationText(locationName);
  const normalizedQuery = normalizeLocationText(query);

  return (
    normalizedName.includes(normalizedQuery) ||
    normalizedQuery.includes(normalizedName)
  );
};

export const filterTripsForRoute = (
  trips: TravelRouteTrip[],
  pickupQuery: string,
  dropoffQuery: string
) => {
  const hasDropoffQuery = Boolean(dropoffQuery.trim());
  const hasPickupQuery = Boolean(pickupQuery.trim());

  return trips.filter((trip) => {
    const matchesDropoff = hasDropoffQuery
      ? matchesLocationQuery(trip.locationTo?.name, dropoffQuery)
      : true;
    const matchesPickup = hasPickupQuery
      ? matchesLocationQuery(trip.locationFrom?.name, pickupQuery) ||
        pickupQuery.toLowerCase().includes('current location')
      : true;

    return matchesDropoff && matchesPickup;
  });
};
