import Button from '@/components/inputs/Button';
import { publicColors as Colors } from '@/containers/public/publicTheme';
import { capitalizeString, getStatusBackgroundColor } from '@/helpers/strings.helper';
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

  const routeLabel = `${trip.locationFrom?.name || 'Unknown'} to ${trip.locationTo?.name || 'Unknown'}`;
  const seatsLeft = Math.max(0, trip.availableCapacity);

  return (
    <>
      <li className="list-none h-full w-full">
        <article
          className="flex h-full w-full flex-col overflow-hidden rounded-md"
          style={{ backgroundColor: Colors.bgAlt }}
        >
          <section className="flex flex-1 flex-col p-6 bg-white shadow-md">
            <header className="mb-8">
              <p
                className="mb-4 text-[12px] font-light leading-tight"
                style={{ color: Colors.neutralLight }}
              >
                Your next trip · #{trip.referenceId}
              </p>
              <div
                className="rounded-md p-6 shadow-sm"
                style={{ backgroundColor: Colors.white }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[12px] font-light leading-tight"
                      style={{ color: Colors.neutralLight }}
                    >
                      {routeLabel}
                    </p>
                    <p
                      className="mt-1 text-[13px] font-semibold leading-tight"
                      style={{ color: Colors.primary }}
                    >
                      {distanceLabel}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`inline-block shadow-sm ${getStatusBackgroundColor(trip.status)}`}
                    >
                      {capitalizeString(trip.status)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="min-w-0 flex-1">
                    <p
                      className="mb-1 text-[12px] font-light leading-tight"
                      style={{ color: Colors.neutralLight }}
                    >
                      Available seats
                    </p>
                    <p
                      className="text-[13px] font-light leading-tight"
                      style={{ color: Colors.primary }}
                    >
                      {seatsLeft} left
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="mb-1 text-[12px] font-light leading-tight"
                      style={{ color: Colors.neutralLight }}
                    >
                      Distance
                    </p>
                    <p
                      className="mt-1 text-[12px] font-light leading-tight"
                      style={{ color: Colors.neutralLight }}
                    >
                      {distanceLabel}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            <section>
              <p
                className="mb-4 text-[12px] font-medium uppercase tracking-wide"
                style={{ color: Colors.neutralLight }}
              >
                Route
              </p>
              <ul className="space-y-3">
                <li
                  className="cursor-pointer rounded-md p-4 shadow-sm transition-opacity hover:opacity-80"
                  style={{ backgroundColor: Colors.white }}
                >
                  <p
                    className="text-[12px] font-medium leading-tight"
                    style={{ color: Colors.primary }}
                  >
                    {trip.locationFrom?.name || 'Unknown'}
                  </p>
                  <p
                    className="mt-1 text-[12px] font-light leading-tight"
                    style={{ color: Colors.neutralLight }}
                  >
                    Pickup
                  </p>
                </li>
                <li
                  className="cursor-pointer rounded-md p-4 shadow-sm transition-opacity hover:opacity-80"
                  style={{ backgroundColor: Colors.white }}
                >
                  <p
                    className="text-[12px] font-medium leading-tight"
                    style={{ color: Colors.primary }}
                  >
                    {trip.locationTo?.name || 'Unknown'}
                  </p>
                  <p
                    className="mt-1 text-[12px] font-light leading-tight"
                    style={{ color: Colors.neutralLight }}
                  >
                    Drop-off
                  </p>
                </li>
              </ul>
            </section>

            <footer className="relative z-10 mt-6 flex flex-col gap-3">
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
                className="w-full min-w-0 sm:w-auto"
              >
                Join
              </Button>
              <p
                className="text-[12px] font-light leading-relaxed"
                style={{ color: Colors.neutralLight }}
              >
                Joining with phone creates a temporary account you can complete later.
              </p>
            </footer>
          </section>
        </article>
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
