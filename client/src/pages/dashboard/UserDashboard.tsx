import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardGraph from "@/components/dashboard/DashboardGraph";
import DashboardTripCard, {
  NearbyDashboardTrip,
} from "@/components/dashboard/DashboardTripCard";
import Button from "@/components/inputs/Button";
import { Heading } from "@/components/inputs/TextInputs";
import AppLayout from "@/containers/navigation/AppLayout";
import { useAppSelector } from "@/states/hooks";
import {
  useCountTransportCards,
  useCountUsers,
  useCountUserTrips,
  useTimeSpentInTrips,
} from "@/usecases/dashboard/dashboard.hooks";
import { useFetchNearbyTrips } from "@/usecases/trips/trip.hooks";
import { faFileLines } from "@fortawesome/free-regular-svg-icons";
import {
  faBus,
  faClockRotateLeft,
  faCreditCard,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Seo } from "@/components/seo";

const UserDashboard = () => {
  /**
   * STATE VARIABLES
   */
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
      startDate: moment().startOf("month").format("YYYY-MM-DD"),
      endDate: moment().endOf("month").format("YYYY-MM-DD"),
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
        title: "Total trips",
        value: userTripsCount,
        change: 0,
        icon: faBus,
        route: "/user-trips",
        isLoading: userTripsCountIsFetching,
      },
      {
        title: "Time spent on trips (hours)",
        value: timeSpentInTrips,
        change: 0,
        icon: faClockRotateLeft,
        route: "/user-trips",
        isLoading: timeSpentInTripsIsFetching,
      },
      {
        title: "Active cards",
        value: transportCardsCount,
        change: 0,
        icon: faCreditCard,
        route: "/account/transport-cards",
        isLoading: transportCardsCountIsFetching,
      },
      {
        title: "Total users",
        value: usersCount,
        change: 0,
        icon: faUsers,
        route: "/users",
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
    ],
  );

  // GRAPH DATA
  const generateRandomData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((month) => ({
      month,
      value: Math.floor(Math.random() * (400 - 100) + 100),
    }));
  };

  const [graphData, setGraphData] =
    useState<{ month: string; value: number }[]>(generateRandomData());

  useEffect(() => {
    setGraphData(generateRandomData());
  }, []);

  const { nearbyTrips, isLoading, locationSource } = useFetchNearbyTrips();

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

          <section className="w-full bg-white/90 rounded-md shadow-sm p-6 flex flex-col gap-4">
            <header>
              <Heading type="h3">Monthly Trips Trend</Heading>
            </header>
            <figure className="w-full h-[300px]">
              <DashboardGraph data={graphData} dataKey="month" />
            </figure>
          </section>
          <section className="w-full flex flex-col gap-3 my-4">
            <header className="w-full flex flex-wrap items-start gap-3 justify-between">
              <article className="flex flex-col gap-1">
                <Heading type="h3">Trips near you</Heading>
                <p className="text-[12px] font-light text-secondary">
                  Live nearby rides ordered around your current or approximate
                  location.
                </p>
              </article>
              <Button icon={faFileLines} route="/trips">
                View all
              </Button>
            </header>
            {locationSource === "ip" && (
              <p className="text-[12px] font-light text-amber-700">
                Approximate IP location is being used. Enable browser location
                for more accurate nearby trips.
              </p>
            )}
            {isLoading ? (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 justify-items-start">
                {Array.from({ length: 3 }).map((_, index) => (
                  <li
                    key={index}
                    className="h-[188px] w-full max-w-[20rem] rounded-md bg-white/80 shadow-sm animate-pulse"
                  />
                ))}
              </ul>
            ) : nearbyTrips?.length ? (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 justify-items-start">
                {nearbyTrips.map((trip: NearbyDashboardTrip) => (
                  <DashboardTripCard key={trip.id} trip={trip} />
                ))}
              </ul>
            ) : (
              <article className="w-full rounded-md bg-white/95 p-4 shadow-sm">
                <p className="text-[12px] font-light text-secondary">
                  No nearby active trips found right now. Check back in a
                  moment.
                </p>
              </article>
            )}
          </section>
        </main>
      </AppLayout>
    </>
  );
};

export default UserDashboard;
