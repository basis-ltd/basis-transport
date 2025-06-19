import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
import Table from '@/components/table/Table';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setCurrentUserTrip, setUserTripsList } from '@/states/slices/userTripSlice';
import { useTripColumns } from '@/usecases/trips/columns.trip';
import { useFetchTrips } from '@/usecases/trips/trip.hooks';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';

const TripsPage = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();
  const { tripsList } = useAppSelector((state) => state.trip);

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
            <Button route="/trips/create" icon={faPlus} primary>
              Create
            </Button>
          </ul>
        </nav>
        <section className="w-full flex flex-col gap-4">
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
      </main>
    </AppLayout>
  );
};

export default TripsPage;
