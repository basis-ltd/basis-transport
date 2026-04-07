import Button from '@/components/inputs/Button';
import { capitalizeString } from '@/helpers/strings.helper';
import { faRoad, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

/** Status chips: readable contrast; radius capped at rounded-md (DESIGN). */
const statusClassNameByStatus: Record<string, string> = {
  PENDING: 'bg-amber-100/90 text-amber-900',
  IN_PROGRESS: 'bg-sky-100/90 text-sky-900',
  COMPLETED: 'bg-primary/10 text-primary',
  CANCELLED: 'bg-destructive/10 text-destructive',
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

  const statusClassName =
    statusClassNameByStatus[trip.status] ?? 'bg-primary/10 text-primary';

  return (
    <li className="surface-card w-full list-none">
      <article className="relative flex h-full flex-col gap-4 overflow-hidden rounded-md p-5 transition-all duration-200 ease-in-out hover:scale-[1.02]">
        <section className="surface-tint pointer-events-none absolute inset-0 rounded-md" />

        <header className="relative z-10 flex items-start justify-between gap-3">
          <section className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="text-[12px] font-normal leading-tight text-primary text-balance">
              {routeLabel}
            </h3>
            <p className="text-[12px] font-light leading-tight text-secondary">
              Trip #{trip.referenceId}
            </p>
          </section>
          <p
            className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-light leading-tight ${statusClassName}`}
          >
            {capitalizeString(trip?.status)}
          </p>
        </header>

        <section className="relative z-10 grid grid-cols-2 gap-3">
          <article className="rounded-md bg-primary/5 p-3 shadow-sm">
            <p className="flex items-center gap-1.5 text-[12px] font-light leading-tight text-secondary">
              <FontAwesomeIcon icon={faUsers} className="text-[10px] text-primary" aria-hidden />
              Seats
            </p>
            <p className="mt-1 text-[12px] font-normal leading-tight text-primary">
              {Math.max(0, trip.availableCapacity)}
            </p>
          </article>
          <article className="rounded-md bg-primary/5 p-3 shadow-sm">
            <p className="flex items-center gap-1.5 text-[12px] font-light leading-tight text-secondary">
              <FontAwesomeIcon icon={faRoad} className="text-[10px] text-primary" aria-hidden />
              Distance
            </p>
            <p className="mt-1 text-[12px] font-normal leading-tight text-primary">
              {distanceLabel}
            </p>
          </article>
        </section>

        <footer className="relative z-10 mt-auto">
          <Button route={`/trips/${trip.id}`} primary className="w-full min-w-0 sm:w-auto sm:min-w-[7rem]">
            View trip
          </Button>
        </footer>
      </article>
    </li>
  );
};

export default DashboardTripCard;
