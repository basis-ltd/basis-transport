import DashboardCard from '@/components/dashboard/DashboardCard';
import DashboardGraph from '@/components/dashboard/DashboardGraph';
import Button from '@/components/inputs/Button';
import { Heading } from '@/components/inputs/TextInputs';
import Table from '@/components/table/Table';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import {
  useCountTransportCards,
  useCountUsers,
  useCountUserTrips,
  useTimeSpentInTrips,
} from '@/usecases/dashboard/dashboard.hooks';
import { useTripColumns } from '@/usecases/trips/columns.trip';
import { useFetchTrips } from '@/usecases/trips/trip.hooks';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';
import {
  faBus,
  faClockRotateLeft,
  faCreditCard,
  faUsers,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { Seo } from '@/components/seo';
import { TripAvailableCapacity } from '@/components/trips/TripAvailableCapacity';

const UserDashboard = () => {
  /**
   * STATE VARIABLES
   */
  const { tripsList } = useAppSelector((state) => state.trip);
  const { user } = useAppSelector((state) => state.auth);

  /**
   * DASHBOARD HOOKS
   */

  // COUNT USER TRIPS
  const { userTripsCount, userTripsCountIsFetching, countUserTrips } =
    useCountUserTrips();

  useEffect(() => {
    countUserTrips({});
  }, [countUserTrips]);

  // TIME SPENT IN TRIPS
  const {
    timeSpentInTrips,
    timeSpentInTripsIsFetching,
    fetchTimeSpentInTrips,
  } = useTimeSpentInTrips();

  useEffect(() => {
    fetchTimeSpentInTrips({
      startDate: moment().startOf('month').format('YYYY-MM-DD'),
      endDate: moment().endOf('month').format('YYYY-MM-DD'),
      userId: user?.id,
    });
  }, [fetchTimeSpentInTrips, user?.id]);

  // COUNT TRANSPORT CARDS
  const {
    transportCardsCount,
    transportCardsCountIsFetching,
    countTransportCards,
  } = useCountTransportCards();

  useEffect(() => {
    countTransportCards({});
  }, [countTransportCards]);

  // COUNT USERS
  const { usersCount, usersCountIsFetching, countUsers } = useCountUsers();

  useEffect(() => {
    countUsers({});
  }, [countUsers]);

  /**
   * DASHBOARD DATA
   */

  // CARD DATA
  const cardsData = useMemo(
    () => [
      {
        title: 'Total trips',
        value: userTripsCount,
        change: 0,
        icon: faBus,
        route: '/user-trips',
        isLoading: userTripsCountIsFetching,
      },
      {
        title: 'Time spent on trips (hours)',
        value: timeSpentInTrips,
        change: 0,
        icon: faClockRotateLeft,
        route: '/user-trips',
        isLoading: timeSpentInTripsIsFetching,
      },
      {
        title: 'Active cards',
        value: transportCardsCount,
        change: 0,
        icon: faCreditCard,
        route: '/account/transport-cards',
        isLoading: transportCardsCountIsFetching,
      },
      {
        title: 'Total users',
        value: usersCount,
        change: 0,
        icon: faUsers,
        route: '/users',
        isLoading: usersCountIsFetching,
      },
    ],
    [
      userTripsCount,
      userTripsCountIsFetching,
      transportCardsCount,
      transportCardsCountIsFetching,
      usersCount,
      usersCountIsFetching,
      timeSpentInTrips,
      timeSpentInTripsIsFetching,
    ]
  );

  // GRAPH DATA
  const generateRandomData = () => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months.map((month) => ({
      month,
      value: Math.floor(Math.random() * (400 - 100) + 100),
    }));
  };

  const [graphData, setGraphData] = useState<
    { month: string; value: number }[]
  >(generateRandomData());

  useEffect(() => {
    setGraphData(generateRandomData());
  }, []);

  /**
   * TRIPS HOOKS
   */

  const { tripsIsFetching, fetchTrips } = useFetchTrips();

  // FETCH TRIPS
  useEffect(() => {
    fetchTrips({ page: 0, size: 5 });
  }, [fetchTrips]);

  // TRIPS COLUMNS
  const { tripsColumns } = useTripColumns();

  return (
    <>
      <Seo
        title="User Dashboard | Basis Transport"
        description="View your personalized dashboard with real-time bus tracking, trip metrics, and transport analytics. Optimize your commute and monitor your public transport activity with Basis Transport."
        canonicalPath="/dashboard"
        ogDescription="View your personalized dashboard with real-time bus tracking, trip metrics, and transport analytics."
      />
      <AppLayout>
        <main className="h-full w-full flex flex-col gap-4">
          <nav className="w-full flex flex-col gap-4">
            <Heading>Dashboard</Heading>
          </nav>
          <section
            className={`w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 justify-between`}
          >
            {cardsData?.map((card, idx) => (
              <article
                key={idx}
                className="transition-transform duration-300 w-full ease-in-out"
              >
                <DashboardCard {...card} />
              </article>
            ))}
          </section>

          <section className="w-full bg-white/90 rounded-md border shadow-md p-6 flex flex-col gap-4">
            <header>
              <Heading type="h3">Monthly Trips Trend</Heading>
            </header>
            <figure className="w-full h-[300px]">
              <DashboardGraph data={graphData} dataKey="month" />
            </figure>
          </section>
          <section className="w-full flex flex-col gap-3 my-4">
            <ul className="w-full flex items-center gap-3 justify-between">
              <Heading type='h3'>Trips near you</Heading>
              <Button icon={faFileLines} route="/trips">
                View all
              </Button>
            </ul>
            <section className="hidden md:block">
              <Table
                columns={tripsColumns}
                data={tripsList}
                isLoading={tripsIsFetching}
                showPagination={false}
              />
            </section>
            <section className="grid grid-cols-1 gap-4">
              {tripsList?.map((trip) => (
                <article
                  key={trip.id}
                  className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm"
                >
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-light uppercase tracking-wide text-secondary/70">
                        Trip {trip.referenceId}
                      </p>
                      <h3 className="text-lg font-medium text-primary">
                        {trip.locationFrom?.name} → {trip.locationTo?.name}
                      </h3>
                      <p className="text-[12px] font-light text-secondary/80 mt-1 flex items-center gap-1">
                        <FontAwesomeIcon icon={faLocationDot} className="text-primary/70" />
                        {trip.startTime
                          ? moment(trip.startTime).format('MMM D, HH:mm')
                          : 'Start time pending'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-light bg-primary/10 text-primary">
                      {trip.status
                        ? trip.status.replace(/_/g, ' ')
                        : 'Unknown'}
                    </span>
                  </header>
                  <section className="grid grid-cols-2 gap-3 mt-4">
                    <article className="p-3 rounded-xl bg-background-secondary/70">
                      <p className="text-[11px] font-light text-secondary/70">Available seats</p>
                      <div className="mt-2">
                        <TripAvailableCapacity tripId={trip.id} />
                      </div>
                    </article>
                    <article className="p-3 rounded-xl bg-background-secondary/70">
                      <p className="text-[11px] font-light text-secondary/70">ETA</p>
                      <p className="text-base font-medium text-primary">
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
    </>
  );
};

export default UserDashboard;
