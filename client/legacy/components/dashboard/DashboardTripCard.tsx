import Button from '@/components/inputs/Button';
import StatusBadge from '@/components/inputs/StatusBadge';

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
      <article className="card-framed flex h-full w-full flex-col overflow-hidden">
        <section className="flex flex-1 flex-col p-6">
          <header className="mb-8">
            <p className="type-meta mb-4">
              Your next trip · #{trip.referenceId}
            </p>
            <div className="card-quiet p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="type-body-sm text-(--muted)">
                    {routeLabel}
                  </p>
                  <p className="mt-1 type-card-title text-(--ink)">
                    {distanceLabel}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={trip.status} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 type-body-sm text-(--muted)">
                    Available seats
                  </p>
                  <p className="type-body-sm leading-tight text-(--ink)">
                    {seatsLeft} left
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 type-body-sm text-(--muted)">
                    Distance
                  </p>
                  <p className="mt-1 type-body-sm text-(--muted)">
                    {distanceLabel}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section>
            <p className="type-meta mb-4">
              Route
            </p>
            <ul className="space-y-3">
              <li className="rounded-md bg-(--paper) p-4 transition-opacity hover:opacity-80">
                <p className="type-label leading-tight text-(--ink)">
                  {trip.locationFrom?.name || 'Unknown'}
                </p>
                <p className="mt-1 type-body-sm text-(--muted)">
                  Pickup
                </p>
              </li>
              <li className="rounded-md bg-(--paper) p-4 transition-opacity hover:opacity-80">
                <p className="type-label leading-tight text-(--ink)">
                  {trip.locationTo?.name || 'Unknown'}
                </p>
                <p className="mt-1 type-body-sm text-(--muted)">
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
