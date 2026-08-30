import DashboardCard from "@/components/dashboard/DashboardCard";
import DonutChart from "@/components/charts/DonutChart";
import SeriesChart from "@/components/charts/SeriesChart";
import DashboardTripCard, {
  NearbyDashboardTrip,
} from "@/components/dashboard/DashboardTripCard";
import Button from "@/components/inputs/Button";
import DatePicker from "@/components/inputs/DatePicker";
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
  faTriangleExclamation,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Seo } from "@/components/seo";
import {
  PageBody,
  PageHeader,
  PageSection,
} from "@/components/layout/PageShell";
import { capitalizeString } from "@/helpers/strings.helper";
import type { ChartDataPoint } from "@/types/common.type";

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

  /* The range used to be hardcoded to the current month, so the metric could
     only ever answer one question. */
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({
    from: moment().startOf("month").toDate(),
    to: moment().endOf("month").toDate(),
  });

  useEffect(() => {
    if (!range.from || !range.to) {
      return;
    }

    fetchTimeSpentInTrips({
      startDate: moment(range.from).format("YYYY-MM-DD"),
      endDate: moment(range.to).format("YYYY-MM-DD"),
      userId: user?.id,
    });
  }, [fetchTimeSpentInTrips, range.from, range.to, user?.id]);

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
        title: "Trips joined",
        value: userTripsCount,
        icon: faBus,
        route: "/user-trips",
        isLoading: userTripsCountIsFetching,
      },
      {
        title: "Hours travelled",
        value: timeSpentInTrips,
        icon: faClockRotateLeft,
        route: "/user-trips",
        isLoading: timeSpentInTripsIsFetching,
      },
      {
        title: "Active cards",
        value: transportCardsCount,
        icon: faCreditCard,
        route: "/account/transport-cards",
        isLoading: transportCardsCountIsFetching,
      },
      {
        title: "Total users",
        value: usersCount,
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

  const { nearbyTrips, isLoading, locationSource } = useFetchNearbyTrips();

  /** Nearby trips grouped by status — real counts, not a generated series. */
  const tripsByStatus = useMemo<ChartDataPoint[]>(() => {
    const counts = new Map<string, number>();
    (nearbyTrips ?? []).forEach((trip: NearbyDashboardTrip) => {
      const label = capitalizeString(trip.status.replace(/_/g, " "));
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return [...counts.entries()].map(([name, value]) => ({ name, value }));
  }, [nearbyTrips]);

  /** Seats still open on each nearby trip, by reference. */
  const capacityByTrip = useMemo<ChartDataPoint[]>(
    () =>
      (nearbyTrips ?? []).slice(0, 8).map((trip: NearbyDashboardTrip) => ({
        name: `#${trip.referenceId}`,
        value: Math.max(0, trip.availableCapacity),
      })),
    [nearbyTrips]
  );

  return (
    <>
      <Seo
        title="User Dashboard | Basis Transport"
        description="View your personalized dashboard with real-time bus tracking, trip metrics, and transport analytics. Optimize your commute and monitor your public transport activity with Basis Transport."
        canonicalPath="/dashboard"
        ogDescription="View your personalized dashboard with real-time bus tracking, trip metrics, and transport analytics."
      />
      <AppLayout>
        <PageBody>
          <PageHeader
            title={`Welcome back, ${user?.name?.split(" ")?.[0] ?? "there"}`}
            description="Your trips, cards, and the services running near you."
            actions={
              <>
                <div className="w-[150px]">
                  <DatePicker
                    label="From"
                    value={range.from}
                    toDate={range.to}
                    onChange={(from) =>
                      setRange((current) => ({ ...current, from }))
                    }
                  />
                </div>
                <div className="w-[150px]">
                  <DatePicker
                    label="To"
                    value={range.to}
                    fromDate={range.from}
                    onChange={(to) =>
                      setRange((current) => ({ ...current, to }))
                    }
                  />
                </div>
              </>
            }
          />

          {/* Equal-height tiles on one four-up grid, so the row reads as a
              single band rather than four cards of different depths. */}
          <section className="grid w-full auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cardsData?.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </section>

          <section className="grid w-full items-stretch gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <PageSection
              title="Seats open on nearby trips"
              description="Remaining capacity on the trips closest to you."
              bodyClassName="flex-1 justify-center"
            >
              {capacityByTrip.length ? (
                <SeriesChart
                  kind="bar"
                  data={capacityByTrip}
                  ariaLabel="Seats still available on each nearby trip"
                  height={260}
                />
              ) : (
                <p className="type-meta py-10 text-center">
                  No nearby trips to chart yet.
                </p>
              )}
            </PageSection>

            <PageSection
              title="Nearby trips by status"
              description="How the trips around you are currently running."
              bodyClassName="flex-1 justify-center"
            >
              {tripsByStatus.length ? (
                <DonutChart
                  data={tripsByStatus}
                  ariaLabel="Nearby trips grouped by status"
                  centerValue={String(nearbyTrips?.length ?? 0)}
                  centerLabel="trips"
                  height={180}
                />
              ) : (
                <p className="type-meta py-10 text-center">
                  No nearby trips to chart yet.
                </p>
              )}
            </PageSection>
          </section>
          <PageSection
            title="Trips near you"
            description="Live nearby rides, ordered by distance from your current or approximate location."
            actions={
              <Button icon={faFileLines} route="/trips">
                View all
              </Button>
            }
          >
            {locationSource === "ip" && (
              <p className="type-meta flex items-start gap-2 text-(--warning)">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mt-[0.2em] size-3 shrink-0"
                  aria-hidden="true"
                />
                Using an approximate location from your network. Turn on browser
                location for accurate nearby trips.
              </p>
            )}
            {isLoading ? (
              <ul className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <li
                    key={index}
                    className="h-[188px] w-full animate-pulse rounded-(--radius-card) bg-(--surface)"
                  />
                ))}
              </ul>
            ) : nearbyTrips?.length ? (
              <ul className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {nearbyTrips.map((trip: NearbyDashboardTrip) => (
                  <DashboardTripCard key={trip.id} trip={trip} />
                ))}
              </ul>
            ) : (
              <p className="type-meta">
                No active trips near you right now. Check back in a moment.
              </p>
            )}
          </PageSection>
        </PageBody>
      </AppLayout>
    </>
  );
};

export default UserDashboard;
