import Button from '@/components/inputs/Button';
import { publicColors as Colors } from '@/containers/public/publicTheme';
import { useAppSelector } from '@/states/hooks';
import { TripStatus } from '@/types/trip.type';
import { UUID } from '@/types';
import { useCreateUserTrip } from '@/usecases/user-trip/userTrip.hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PhoneJoinModal from './PhoneJoinModal';

interface NearbyTripCardProps {
  trip: {
    id: UUID;
    referenceId: string;
    status: TripStatus;
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
  };
  fallbackEntranceLocation: [number, number];
}

const statusClassNameByStatus: Record<TripStatus, string> = {
  [TripStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [TripStatus.IN_PROGRESS]: 'bg-sky-100 text-sky-800',
  [TripStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [TripStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

const NearbyTripCard = ({ trip, fallbackEntranceLocation }: NearbyTripCardProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [quickJoinModalOpen, setQuickJoinModalOpen] = useState(false);
  const { createUserTrip, createUserTripIsLoading } = useCreateUserTrip();

  const fromCoordinates = trip.locationFrom?.address?.coordinates;
  const entranceCoordinates: [number, number] =
    fromCoordinates && fromCoordinates.length >= 2
      ? [fromCoordinates[0], fromCoordinates[1]]
      : fallbackEntranceLocation;

  const distanceLabel =
    typeof trip.distanceMeters === 'number' && Number.isFinite(trip.distanceMeters)
      ? `${(trip.distanceMeters / 1000).toFixed(1)} km away`
      : 'Distance unavailable';

  return (
    <>
      <li className="shadow-sm rounded-md bg-white p-5 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-medium" style={{ color: Colors.primary }}>
              {trip.locationFrom?.name || 'Unknown'} to {trip.locationTo?.name || 'Unknown'}
            </h3>
            <p className="text-[12px]" style={{ color: Colors.neutralLight }}>
              #{trip.referenceId}
            </p>
          </div>

          <span
            className={`text-[11px] px-2 py-1 rounded-full ${statusClassNameByStatus[trip.status]}`}
          >
            {trip.status.replace('_', ' ')}
          </span>
        </header>

        <aside className="text-[12px] space-y-1" style={{ color: Colors.neutralLight }}>
          <p>Available seats: {Math.max(0, trip.availableCapacity)}</p>
          <p>{distanceLabel}</p>
        </aside>

        <Button
          primary
          onClick={async (event) => {
            event.preventDefault();

            if (!user) {
              setQuickJoinModalOpen(true);
              return;
            }

            try {
              await createUserTrip({
                tripId: trip.id,
                userId: user.id,
                entranceLocation: {
                  type: 'Point',
                  coordinates: entranceCoordinates,
                },
              }).unwrap();

              navigate(`/trips/${trip.id}`);
            } catch (error) {
              toast.error(
                (
                  error as {
                    data?: {
                      message?: string;
                    };
                  }
                )?.data?.message ?? 'Unable to join trip'
              );
            }
          }}
          isLoading={createUserTripIsLoading}
          disabled={trip.availableCapacity <= 0}
        >
          Join
        </Button>

        <p className="text-[12px] font-light text-neutral-500">
          Joining with phone creates a temporary account you can complete later.
        </p>
      </li>

      <PhoneJoinModal
        open={quickJoinModalOpen}
        onOpenChange={setQuickJoinModalOpen}
        tripId={trip.id}
        entranceLocation={{
          type: 'Point',
          coordinates: entranceCoordinates,
        }}
      />
    </>
  );
};

export default NearbyTripCard;
