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
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faRoute } from '@fortawesome/free-solid-svg-icons';

const UserTripsPage = () => {
  /**
   * STATE VARIABLES
   */
  const { userTripsList } = useAppSelector((state) => state.userTrip);
  const { user } = useAppSelector((state) => state.auth);
  const [tripId, setTripId] = useState<UUID | null>(null);
  const [userId, setUserId] = useState<UUID | null>(null);

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

  useEffect(() => {
    if (user?.id && user?.userRoles?.flatMap((role) => role.role?.name ?? '').includes('USER')) {
      setUserId(user?.id);
    } else {
      setUserId(null);
    }
  }, [user?.id, user?.userRoles]);

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
    fetchUserTrips({ page, size, tripId: tripId ?? undefined, userId: userId ?? undefined });
  }, [fetchUserTrips, page, size, tripId, userId]);

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <ul className="w-full flex items-center gap-3 justify-between">
            <Heading>User Trips</Heading>
          </ul>
        </nav>
        <section className="w-full flex flex-col gap-4">
          <section className="hidden md:block">
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
          <section className="grid grid-cols-1 gap-4 md:hidden">
            {userTripsList?.map((userTrip) => (
              <article
                key={userTrip.id}
                className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"
              >
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-secondary/70">
                      Trip {userTrip.trip?.referenceId ?? '--'}
                    </p>
                    <h3 className="text-lg font-semibold text-primary">
                      {userTrip.trip?.locationFrom?.name ?? 'Start'} → {userTrip.trip?.locationTo?.name ?? 'Destination'}
                    </h3>
                    <p className="text-[12px] text-secondary/80 mt-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faLocationDot} className="text-primary/70" />
                      {userTrip.startTime
                        ? moment(userTrip.startTime).format('MMM D, HH:mm')
                        : 'Start time pending'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
                    {userTrip.status
                      ? userTrip.status.replace(/_/g, ' ')
                      : 'Unknown'}
                  </span>
                </header>
                <section className="flex items-center gap-2 text-[12px] text-secondary/70 mt-4">
                  <FontAwesomeIcon icon={faRoute} className="text-primary" />
                  {userTrip.user?.name ?? 'Passenger'}
                </section>
                <section className="grid grid-cols-2 gap-3 mt-4">
                  <article className="p-3 rounded-xl bg-background-secondary/70">
                    <p className="text-[11px] text-secondary/70">Started</p>
                    <p className="text-base font-semibold text-primary">
                      {userTrip.startTime
                        ? moment(userTrip.startTime).fromNow()
                        : 'N/A'}
                    </p>
                  </article>
                  <article className="p-3 rounded-xl bg-background-secondary/70">
                    <p className="text-[11px] text-secondary/70">Duration</p>
                    <p className="text-base font-semibold text-primary">
                      {userTrip.startTime && userTrip.endTime
                        ? `${moment(userTrip.endTime).diff(
                            moment(userTrip.startTime),
                            'minutes'
                          )} min`
                        : 'In progress'}
                    </p>
                  </article>
                </section>
                <footer className="flex items-center justify-between mt-4">
                  <Button route={`/user-trips/${userTrip.id}`} primary className="w-full">
                    View trip
                  </Button>
                </footer>
              </article>
            ))}
          </section>
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
