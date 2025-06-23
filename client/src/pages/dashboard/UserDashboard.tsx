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
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';

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
      <Helmet>
        <title>User Dashboard | Basis Transport</title>
        <meta name="description" content="View your personalized dashboard with real-time bus tracking, trip metrics, and transport analytics. Optimize your commute and monitor your public transport activity with Basis Transport." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Basis Transport Team" />
        <meta property="og:title" content="User Dashboard | Basis Transport" />
        <meta property="og:description" content="View your personalized dashboard with real-time bus tracking, trip metrics, and transport analytics." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://transport.basis.rw/dashboard" />
        <meta property="og:image" content="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%9A%8C%3C/text%3E%3C/svg%3E" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%9A%8C%3C/text%3E%3C/svg%3E" />
        <link rel="canonical" href="https://transport.basis.rw/dashboard" />
      </Helmet>
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

          <section className="w-full bg-background/5 rounded-xl shadow p-6 flex flex-col gap-4">
            <header>
              <Heading type="h3" className="text-primary">
                Monthly Trips Trend
              </Heading>
            </header>
            <figure className="w-full h-[300px]">
              <DashboardGraph data={graphData} dataKey="month" />
            </figure>
          </section>
          <section className="w-full flex flex-col gap-3 my-4">
            <ul className="w-full flex items-center gap-3 justify-between">
              <Heading>Trips near you</Heading>
              <Button icon={faFileLines} route="/trips">
                View all
              </Button>
            </ul>
            <Table
              columns={tripsColumns}
              data={tripsList}
              isLoading={tripsIsFetching}
              showPagination={false}
            />
          </section>
        </main>
      </AppLayout>
    </>
  );
};

export default UserDashboard;
