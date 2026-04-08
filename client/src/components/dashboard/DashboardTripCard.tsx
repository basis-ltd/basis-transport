import Button from '@/components/inputs/Button';
import { capitalizeString, getStatusBackgroundColor } from '@/helpers/strings.helper';

export type NearbyDashboardTrip = {
  id: string;
  referenceId: string;
  status: string;
  availableCapacity: number;
  distanceMeters?: number;
  locationFrom?: {
    name?: string;
  };
  locationTo?: {
    name?: string;
  };
};

interface DashboardTripCardProps {
  trip: NearbyDashboardTrip;
}

const DashboardTripCard = ({ trip }: DashboardTripCardProps) => {
  const distanceLabel =
    typeof trip.distanceMeters === 'number' && Number.isFinite(trip.distanceMeters)
      ? `${(trip.distanceMeters / 1000).toFixed(1)} km away`
      : 'Distance unavailable';

  const routeLabel = `${trip.locationFrom?.name || 'Unknown'} to ${trip.locationTo?.name || 'Unknown'}`;
  const seatsLeft = Math.max(0, trip.availableCapacity);

  return (
    <li className="list-none h-full w-full">
      <article className="flex h-full w-full flex-col overflow-hidden rounded-md shadow-sm bg-background">
        <section className="flex flex-1 flex-col p-6">
          <header className="mb-8">
            <p className="mb-4 text-[12px] font-light leading-tight text-secondary">
              Your next trip · #{trip.referenceId}
            </p>
            <div className="rounded-md bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-light leading-tight text-secondary">
                    {routeLabel}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold leading-tight text-primary">
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
                  <p className="mb-1 text-[12px] font-light leading-tight text-secondary">
                    Available seats
                  </p>
                  <p className="text-[13px] font-light leading-tight text-primary">
                    {seatsLeft} left
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[12px] font-light leading-tight text-secondary">
                    Distance
                  </p>
                  <p className="mt-1 text-[12px] font-light leading-tight text-secondary">
                    {distanceLabel}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section>
            <p className="mb-4 text-[12px] font-medium uppercase tracking-wide text-secondary">
              Route
            </p>
            <ul className="space-y-3">
              <li className="rounded-md bg-white p-4 shadow-sm transition-opacity hover:opacity-80">
                <p className="text-[12px] font-medium leading-tight text-primary">
                  {trip.locationFrom?.name || 'Unknown'}
                </p>
                <p className="mt-1 text-[12px] font-light leading-tight text-secondary">
                  Pickup
                </p>
              </li>
              <li className="rounded-md bg-white p-4 shadow-sm transition-opacity hover:opacity-80">
                <p className="text-[12px] font-medium leading-tight text-primary">
                  {trip.locationTo?.name || 'Unknown'}
                </p>
                <p className="mt-1 text-[12px] font-light leading-tight text-secondary">
                  Drop-off
                </p>
              </li>
            </ul>
          </section>

          <footer className="relative z-10 mt-6">
            <Button
              route={`/trips/${trip.id}`}
              primary
              className="w-full min-w-0 sm:w-auto sm:min-w-[7rem]"
            >
              View trip
            </Button>
          </footer>
        </section>
      </article>
    </li>
  );
};

export default DashboardTripCard;
