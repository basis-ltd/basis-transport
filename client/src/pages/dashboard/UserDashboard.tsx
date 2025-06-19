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
import { useEffect, useMemo, useState } from 'react';

const UserDashboard = () => {
  /**
   * STATE VARIABLES
   */
  const { tripsList } = useAppSelector((state) => state.trip);

  /**
   * DASHBOARD HOOKS
   */

  // COUNT USER TRIPS
  const { userTripsCount, userTripsCountIsFetching, countUserTrips } =
    useCountUserTrips();

  useEffect(() => {
    countUserTrips({});
  }, [countUserTrips]);

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
        route: '/trips',
        isLoading: userTripsCountIsFetching,
      },
      {
        title: 'Time spent on trips',
        value: userTripsCount,
        change: 0,
        icon: faClockRotateLeft,
        route: '/trips',
        isLoading: userTripsCountIsFetching,
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
  );
};

export default UserDashboard;
