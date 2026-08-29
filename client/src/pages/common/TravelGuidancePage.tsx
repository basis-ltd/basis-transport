import '@/styles/landingPage.css';
import { useLazyFetchNearbyTripsQuery } from '@/api/queries/apiQuerySlice';
import { Seo } from '@/components/seo';
import PublicFooter from '@/containers/public/PublicFooter';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import { capitalizeString } from '@/helpers/strings.helper';
import { ArrowLeft, Bus, Clock3, MapPin, Users } from 'lucide-react';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  filterTripsForRoute,
  type TravelRouteTrip,
} from './travelGuidance.utils';

const TRAVEL_GUIDELINES = [
  'Arrive at the stop a few minutes before the scheduled departure.',
  'Check seat availability before boarding — capacity updates in real time.',
  'Keep your phone handy for live trip status once you sign in.',
];

const TravelGuidancePage = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));
  const hasCoordinates = Boolean(lat) && Boolean(lng) && Number.isFinite(lat) && Number.isFinite(lng);
  const hasRoute = Boolean(from || to);

  const [fetchNearbyTrips, { data, isFetching }] = useLazyFetchNearbyTripsQuery();

  useEffect(() => {
    if (!from && !to && !hasCoordinates) {
      return;
    }

    fetchNearbyTrips({
      lat: hasCoordinates ? lat : undefined,
      lng: hasCoordinates ? lng : undefined,
      limit: 5,
    });
  }, [fetchNearbyTrips, from, to, hasCoordinates, lat, lng]);

  const allTrips = (data?.data ?? []) as TravelRouteTrip[];

  const matchingTrips = useMemo(
    () => filterTripsForRoute(allTrips, from, to),
    [allTrips, from, to]
  );

  const otherNearbyTrips = useMemo(
    () =>
      allTrips.filter(
        (trip) => !matchingTrips.some((match) => match.id === trip.id)
      ),
    [allTrips, matchingTrips]
  );

  const formatSchedule = (startTime?: string | null) => {
    if (!startTime) {
      return 'Schedule to be confirmed';
    }

    return moment(startTime).format('ddd, MMM D · h:mm A');
  };

  const formatDistance = (distanceMeters?: number) => {
    if (typeof distanceMeters !== 'number') {
      return 'Nearby';
    }

    return `${(distanceMeters / 1000).toFixed(1)} km from you`;
  };

  const renderTripCard = (trip: TravelRouteTrip) => {
    const routeLabel = `${trip.locationFrom?.name ?? 'Pickup'} → ${trip.locationTo?.name ?? 'Drop-off'}`;
    const seatsLeft = Math.max(0, trip.availableCapacity);
    const totalSeats = trip.totalCapacity ?? seatsLeft;

    return (
      <li
        key={trip.id}
        className="rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-paper)] p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="landing-label text-[var(--landing-ink)]">
              Trip #{trip.referenceId}
            </p>
            <p className="landing-body text-[var(--landing-muted)]">{routeLabel}</p>
          </div>
          <span className="landing-meta rounded-full border border-[var(--landing-line)] px-2.5 py-1">
            {capitalizeString(trip.status.replace(/_/g, ' '))}
          </span>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          <li className="flex items-center gap-2 landing-meta">
            <Clock3 className="size-4 shrink-0" aria-hidden="true" />
            <span>{formatSchedule(trip.startTime)}</span>
          </li>
          <li className="flex items-center gap-2 landing-meta">
            <Users className="size-4 shrink-0" aria-hidden="true" />
            <span>
              {seatsLeft} of {totalSeats} seats available
            </span>
          </li>
          <li className="flex items-center gap-2 landing-meta">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span>{formatDistance(trip.distanceMeters)}</span>
          </li>
        </ul>
      </li>
    );
  };

  return (
    <>
      <Seo
        title="Travel options | Basis Transport"
        description="Bus schedules, seat availability, and travel guidance for your route."
        canonicalPath="/travel"
      />

      <PublicLayout>
        <PublicNavbar />
        <main className="landing-page landing-paper min-h-[calc(100vh-4rem)]">
          <div className="landing-container py-10 lg:py-14">
            <Link
              to="/"
              className="landing-link-sweep mb-6 inline-flex items-center gap-2"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to home
            </Link>

            <header className="mb-8 max-w-3xl space-y-3">
              <h1 className="landing-display text-[var(--landing-ink)]">
                {hasRoute ? 'Your travel options' : 'Departures near you'}
              </h1>
              <p className="landing-body text-[var(--landing-muted)]">
                {hasRoute
                  ? 'Schedules, capacity, and guidance for public transport along your route.'
                  : 'Schedules, capacity, and guidance for public transport around your current location.'}
              </p>
            </header>

            {hasRoute ? (
            <section
              aria-labelledby="route-summary-heading"
              className="mb-8 rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-surface)] p-5"
            >
              <h2 id="route-summary-heading" className="landing-label mb-3">
                Route
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <p className="flex items-start gap-2 landing-body">
                  <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="landing-meta block">From</span>
                    {from || '—'}
                  </span>
                </p>
                <p className="flex items-start gap-2 landing-body">
                  <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="landing-meta block">To</span>
                    {to || '—'}
                  </span>
                </p>
              </div>
            </section>
            ) : null}

            <section aria-labelledby="bus-options-heading" className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Bus className="size-5" aria-hidden="true" />
                <h2 id="bus-options-heading" className="landing-label">
                  {hasRoute ? 'Bus options' : 'Nearby departures'}
                </h2>
              </div>

              {isFetching ? (
                <ul className="grid gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <li
                      key={index}
                      className="h-28 animate-pulse rounded-[var(--landing-radius)] bg-[var(--landing-surface)]"
                    />
                  ))}
                </ul>
              ) : matchingTrips.length ? (
                <ul className="grid gap-3">{matchingTrips.map(renderTripCard)}</ul>
              ) : (
                <div className="rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-paper)] p-5">
                  <p className="landing-body text-[var(--landing-muted)]">
                    No exact matches for this route yet. Try refining your
                    locations, or review nearby services below.
                  </p>
                  {otherNearbyTrips.length ? (
                    <ul className="mt-4 grid gap-3">
                      {otherNearbyTrips.map(renderTripCard)}
                    </ul>
                  ) : null}
                </div>
              )}
            </section>

            <section
              aria-labelledby="guidelines-heading"
              className="mb-10 max-w-3xl"
            >
              <h2 id="guidelines-heading" className="landing-label mb-3">
                Travel guidelines
              </h2>
              <ul className="grid gap-2">
                {TRAVEL_GUIDELINES.map((guideline) => (
                  <li
                    key={guideline}
                    className="landing-body text-[var(--landing-muted)]"
                  >
                    {guideline}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-paper)] p-5 max-w-3xl">
              <h2 className="landing-label mb-2">Need more detail?</h2>
              <p className="landing-body mb-4 text-[var(--landing-muted)]">
                Sign in to track live arrivals, save routes, and get personalized
                commute updates.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth/login" className="landing-link-sweep">
                  Sign in
                </Link>
                <Link to="/auth/register" className="landing-link-sweep">
                  Create account
                </Link>
              </div>
            </section>
          </div>
        </main>
        <PublicFooter />
      </PublicLayout>
    </>
  );
};

export default TravelGuidancePage;
