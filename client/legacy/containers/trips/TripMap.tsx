import MapView from '@/components/maps/MapView';
import { Trip } from '@/types/trip.type';
import { useGetTripLocations } from '@/usecases/trips/trip.hooks';

const TripMap = ({ trip }: { trip?: Trip }) => {
  // GET TRIP LOCATIONS
  const { origin, destination, defaultCenter } = useGetTripLocations({
    trip,
  });

  return (
    <MapView
      origin={origin}
      destination={destination}
      defaultCenter={defaultCenter}
      fromLabel="Current Bus Location"
      toLabel="Your Location"
    />
  );
};

export default TripMap;
