import { useCountAvailableCapacity } from '@/usecases/trips/trip.hooks';
import { useEffect } from 'react';
import Loader from '../inputs/Loader';
import { Link } from 'react-router-dom';

export const TripAvailableCapacity = ({ tripId }: { tripId: string }) => {
  const {
    countAvailableCapacity,
    availableCapacity,
    tripAvailableCapacityIsFetching,
  } = useCountAvailableCapacity();

  useEffect(() => {
    if (tripId) {
      countAvailableCapacity({ id: tripId });
    }
  }, [tripId, countAvailableCapacity]);

  return (
    <Link
      to={`/user-trips?tripId=${tripId}`}
      className="text-sm p-1 rounded-md bg-gray-50 hover:bg-gray-100"
    >
      {tripAvailableCapacityIsFetching ? (
        <Loader className="text-primary" />
      ) : (
        availableCapacity?.availableCapacity ?? 'N/A'
      )}
    </Link>
  );
};
