import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
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

const TripsPage = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();
  const { tripsList } = useAppSelector((state) => state.trip);
  const { user } = useAppSelector((state) => state.auth);

  /**
   * FETCH TRIPS
   */
  const {
    tripsIsFetching,
    page,
    size,
    totalCount,
    totalPages,
    setPage,
    setSize,
    fetchTrips,
  } = useFetchTrips();

  // FETCH TRIPS
  useEffect(() => {
    fetchTrips({ page, size });
  }, [fetchTrips, page, size]);

  // TRIPS COLUMNS
  const { tripsColumns } = useTripColumns();

  // RESET USER TRIPS
  useEffect(() => {
    dispatch(setUserTripsList([]));
    dispatch(setCurrentUserTrip(undefined));
  }, [dispatch]);

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <ul className="w-full flex items-center gap-3 justify-between">
            <Heading>Trips</Heading>
            {user?.userRoles?.flatMap(
              (role) =>
                ['DRIVER', 'SUPER_ADMIN'].includes(role.role?.name ?? '') && (
                  <Button route="/trips/create" icon={faPlus} primary>
                    Create
                  </Button>
                )
            )}
          </ul>
        </nav>
        <section className="w-full flex flex-col gap-4">
          <section className="hidden md:block">
            <Table
              columns={tripsColumns}
              data={tripsList}
              isLoading={tripsIsFetching}
              page={page}
              size={size}
              totalCount={totalCount}
              totalPages={totalPages}
              setPage={setPage}
              setSize={setSize}
            />
          </section>
          <section className="grid grid-cols-1 gap-4 md:hidden">
            {tripsList?.map((trip) => (
              <article
                key={trip.id}
                className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-secondary/70">
                      Trip {trip.referenceId}
                    </p>
                    <h3 className="text-lg font-semibold text-primary">
                      {trip.locationFrom?.name} → {trip.locationTo?.name}
                    </h3>
                    <p className="text-[12px] text-secondary/80 mt-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faLocationDot} className="text-primary/70" />
                      {trip.startTime
                        ? moment(trip.startTime).format('MMM D, HH:mm')
                        : 'Start time pending'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
                    {trip.status
                      ? trip.status.replace(/_/g, ' ')
                      : 'Unknown'}
                  </span>
                </header>
                <section className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 text-[12px] text-secondary/70">
                    <FontAwesomeIcon icon={faBusSimple} className="text-primary" />
                    Bus Service
                  </div>
                </section>
                <section className="grid grid-cols-2 gap-3 mt-4">
                  <article className="p-3 rounded-xl bg-background-secondary/70">
                    <p className="text-[11px] text-secondary/70">Available seats</p>
                    <div className="mt-2">
                      <TripAvailableCapacity tripId={trip.id} />
                    </div>
                  </article>
                  <article className="p-3 rounded-xl bg-background-secondary/70">
                    <p className="text-[11px] text-secondary/70">ETA</p>
                    <p className="text-base font-semibold text-primary">
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
      </main>
    </AppLayout>
  );
};

export default TripsPage;
