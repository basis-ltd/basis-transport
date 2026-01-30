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
      className="inline-flex items-center gap-2 text-[12px] font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    >
      {tripAvailableCapacityIsFetching ? (
        <Loader className="text-primary" />
      ) : (
        <>
          <span className="font-semibold">
            {availableCapacity?.availableCapacity ?? 'N/A'}
          </span>
          <span className="text-[11px] text-secondary">seats</span>
        </>
      )}
    </Link>
  );
};
