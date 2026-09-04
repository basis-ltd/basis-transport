import { Link } from 'react-router-dom';
import { Bus, CheckCircle2, ClipboardList, Navigation } from 'lucide-react';
import { useGetDriverSummaryQuery } from '@/api/queries/apiQuerySlice';
import type { DashboardResponse, DriverSummary } from '@/types/dashboard.type';
import { PageSection } from '@/components/layout/PageShell';
import StatCard from './StatCard';

const formatTime = (iso: string | null | undefined): string => {
  if (!iso) return 'Unscheduled';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? 'Unscheduled'
    : date.toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      });
};

const DriverDashboard = () => {
  const { data, isLoading, isError, refetch } = useGetDriverSummaryQuery(
    undefined,
  );
  const summary = (data as DashboardResponse<DriverSummary> | undefined)?.data;

  if (isLoading) {
    return (
      <p className="type-body-sm text-(--muted)" role="status">
        Loading your assignments…
      </p>
    );
  }

  if (isError || !summary) {
    return (
      <PageSection title="Could not load your assignments">
        <p className="type-body-sm text-(--muted)">
          Something went wrong fetching today&apos;s trips. Please try again.
        </p>
        <button
          type="button"
          className="type-body-sm text-(--ink) underline underline-offset-4"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </PageSection>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      {summary.currentTrip ? (
        <PageSection
          title="Current trip"
          description={`Started ${formatTime(summary.currentTrip.startTime)} · Status ${summary.currentTrip.status.replace('_', ' ').toLowerCase()}`}
          actions={
            <Link
              to="/travel"
              className="type-body-sm inline-flex items-center gap-1 text-(--ink) underline underline-offset-4"
            >
              <Navigation size={14} aria-hidden="true" /> Open journey view
            </Link>
          }
        >
          <p className="type-body-sm text-(--muted)">
            Trip {summary.currentTrip.trip?.referenceId ?? summary.currentTrip.tripId}
          </p>
        </PageSection>
      ) : (
        <PageSection title="No trip in progress">
          <p className="type-body-sm text-(--muted)">
            {summary.todaysTrips.length > 0
              ? 'Your next assignment is listed below.'
              : 'Nothing assigned today. Check back later or plan a journey.'}
          </p>
        </PageSection>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Assigned today"
          value={summary.todaysTrips.length}
          sub="Trips starting today"
          icon={<ClipboardList size={18} aria-hidden="true" />}
        />
        <StatCard
          label="Completed this week"
          value={summary.completedThisWeek}
          sub="Finished in the last 7 days"
          icon={<CheckCircle2 size={18} aria-hidden="true" />}
        />
        <StatCard
          label="Total trips"
          value={summary.totalTrips}
          sub="All trips linked to your account"
          icon={<Bus size={18} aria-hidden="true" />}
          actionHref="/travel"
          actionLabel="Plan a journey"
        />
      </div>

      <PageSection
        title="Today's assignments"
        description={`${summary.todaysTrips.length} trip${summary.todaysTrips.length === 1 ? '' : 's'} starting today, earliest first.`}
      >
        {summary.todaysTrips.length === 0 ? (
          <p className="type-body-sm text-(--muted)">
            No assignments today.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {summary.todaysTrips.map((trip) => (
              <li
                key={trip.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-(--line) pb-3 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="type-body-sm text-(--ink)">
                    Trip {trip.trip?.referenceId ?? trip.tripId}
                  </p>
                  <p className="type-meta text-(--muted)">
                    {formatTime(trip.startTime)} ·{' '}
                    {trip.status.replace('_', ' ').toLowerCase()}
                  </p>
                </div>
                <Link
                  to="/travel"
                  className="type-body-sm text-(--ink) underline underline-offset-4"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageSection>
    </div>
  );
};

export default DriverDashboard;
