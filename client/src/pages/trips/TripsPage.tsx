import Button from '@/components/inputs/Button';
import Table from '@/components/table/Table';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setCurrentUserTrip, setUserTripsList } from '@/states/slices/userTripSlice';
import { useTripColumns } from '@/usecases/trips/columns.trip';
import { useFetchTrips } from '@/usecases/trips/trip.hooks';
import { faBusSimple, faLocationDot, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useEffect } from 'react';
import { TripAvailableCapacity } from '@/components/trips/TripAvailableCapacity';
import { Trip } from '@/types/trip.type';
import StartTrip from './StartTrip';
import { PageBody, PageHeader } from "@/components/layout/PageShell";

const TripsPage = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tripsList, startTripModal } = useAppSelector((state) => state.trip);

  /**
   * FETCH TRIPS
   */
  const {
    isFetching,
    page,
    size,
    setPage,
    setSize,
    totalCount,
    totalPages,
    fetchTrips,
  } = useFetchTrips();

  useEffect(() => {
    if (!startTripModal) {
      fetchTrips({ page, size });
    }
  }, [fetchTrips, page, size, startTripModal]);

  // TRIPS COLUMNS
  const { tripsColumns } = useTripColumns();

  // RESET USER TRIPS
  useEffect(() => {
    dispatch(setUserTripsList([]));
    dispatch(setCurrentUserTrip(undefined));
  }, [dispatch]);

  const canCreateTrip = Boolean(
    user?.userRoles?.some((role) =>
      ['DRIVER', 'SUPER_ADMIN'].includes(role.role?.name ?? '')
    )
  );

  return (
    <AppLayout>
      <PageBody>
        <PageHeader
          title="Trips"
          description="Scheduled and running services across the network."
          actions={
            /* `flatMap` over the roles rendered one Create button per matching
               role, so anyone who was both a driver and a super admin got two. */
            canCreateTrip ? (
              <Button route="/trips/create" icon={faPlus} primary>
                Create trip
              </Button>
            ) : null
          }
        />
        <section className="w-full flex flex-col gap-4">
            <Table
              columns={tripsColumns}
              data={tripsList}
              isLoading={isFetching}
              page={page}
              size={size}
              totalCount={totalCount}
              totalPages={totalPages}
              setPage={setPage}
              setSize={setSize}
            />
          <section className="grid grid-cols-1 gap-4 md:hidden">
            {tripsList?.map((trip: Trip) => (
              <article
                key={trip.id}
                className="card-framed p-5"
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <p className="type-meta text-(--muted)">
                      Trip {trip.referenceId}
                    </p>
                    <h3 className="text-lg font-medium text-(--ink)">
                      {trip.locationFrom?.name} → {trip.locationTo?.name}
                    </h3>
                    <p className="type-body-sm text-(--muted) mt-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faLocationDot} className="text-(--ink)" />
                      {trip.startTime
                        ? moment(trip.startTime).format('MMM D, HH:mm')
                        : 'Start time pending'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full type-meta bg-(--surface) text-(--ink)">
                    {trip.status
                      ? trip.status.replace(/_/g, ' ')
                      : 'Unknown'}
                  </span>
                </header>
                <section className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 type-body-sm text-(--muted)">
                    <FontAwesomeIcon icon={faBusSimple} className="text-(--ink)" />
                    Bus Service
                  </div>
                </section>
                <section className="grid grid-cols-2 gap-3 mt-4">
                  <article className="p-3 rounded-xl bg-(--surface)/70">
                    <p className="type-meta text-(--muted)">Available seats</p>
                    <div className="mt-2">
                      <TripAvailableCapacity tripId={trip.id} />
                    </div>
                  </article>
                  <article className="p-3 rounded-xl bg-(--surface)/70">
                    <p className="type-meta text-(--muted)">ETA</p>
                    <p className="text-base font-medium text-(--ink)">
                      {trip.startTime
                        ? moment(trip.startTime).add(15, 'minutes').fromNow()
                        : 'TBD'}
                    </p>
                  </article>
                </section>
                <footer className="flex items-center justify-between mt-4">
                  <Button route={`/trips/${trip.id}`} primary className="w-full">
                    View trip
                  </Button>
                </footer>
              </article>
            ))}
          </section>
        </section>
      </PageBody>
      <StartTrip />
    </AppLayout>
  );
};

export default TripsPage;
