import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
import Table from '@/components/table/Table';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { UUID } from '@/types';
import { useUserTripColumns } from '@/usecases/user-trip/columns.userTrip';
import { useFetchUserTrips } from '@/usecases/user-trip/userTrip.hooks';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const UserTripsPage = () => {
  /**
   * STATE VARIABLES
   */
  const { userTripsList } = useAppSelector((state) => state.userTrip);
  const { user } = useAppSelector((state) => state.auth);
  const [tripId, setTripId] = useState<UUID | null>(null);

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tripId = searchParams.get('tripId');
    if (tripId && !['null', 'undefined'].includes(tripId)) {
      setTripId(tripId as UUID);
    }
  }, [searchParams]);

  /**
   * USER TRIPS HOOKS
   */

  // FETCH USER TRIPS
  const {
    userTripsIsFetching,
    fetchUserTrips,
    page,
    size,
    totalCount,
    totalPages,
    setPage,
    setSize,
  } = useFetchUserTrips();

  // USER TRIPS COLUMNS
  const { userTripColumns } = useUserTripColumns({ page, size });

  // FETCH USER TRIPS
  useEffect(() => {
    fetchUserTrips({ page, size, tripId: tripId ?? undefined, userId: user?.id });
  }, [fetchUserTrips, page, size, tripId, user?.id]);

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <ul className="w-full flex items-center gap-3 justify-between">
            <Heading>User Trips</Heading>
          </ul>
        </nav>
        <section className="w-full flex flex-col gap-4">
          <Table
            columns={userTripColumns}
            data={userTripsList}
            isLoading={userTripsIsFetching}
            page={page}
            size={size}
            totalCount={totalCount}
            totalPages={totalPages}
            setPage={setPage}
            setSize={setSize}
          />
        </section>
        <menu className='w-full flex items-center gap-3 justify-between'>
          <Button onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}>
            Back
          </Button>
        </menu>
      </main>
    </AppLayout>
  );
};

export default UserTripsPage;
