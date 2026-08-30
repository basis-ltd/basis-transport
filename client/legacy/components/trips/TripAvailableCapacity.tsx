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
      className="inline-flex items-center gap-1 text-[12px] font-normal px-3 py-1 rounded-md bg-(--surface) text-(--ink) hover:bg-(--surface) transition-colors"
    >
      {tripAvailableCapacityIsFetching ? (
        <Loader className="text-(--ink)" />
      ) : (
        <>
          <span className="font-normal text-xs">
            {availableCapacity?.availableCapacity ?? 'N/A'}
          </span>
          <span className="text-xs text-(--muted)">seats</span>
        </>
      )}
    </Link>
  );
};
