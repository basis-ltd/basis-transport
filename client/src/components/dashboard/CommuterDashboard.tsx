import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  History,
  Route,
} from 'lucide-react';
import { useGetCommuterSummaryQuery } from '@/api/queries/apiQuerySlice';
import { useAppSelector } from '@/states/hooks';
import type {
  CommuterSummary,
  DashboardResponse,
} from '@/types/dashboard.type';
import { PageSection } from '@/components/layout/PageShell';
import SeriesChart from '@/components/charts/SeriesChart';
import StatCard from './StatCard';

const formatTripTime = (iso: string | null | undefined): string => {
  if (!iso) return 'Unscheduled';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? 'Unscheduled'
    : date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

const CommuterDashboard = () => {
  const profileComplete = useAppSelector(
    (s) => s.auth.user?.isProfileComplete,
  );
  const { data, isLoading, isError, refetch } = useGetCommuterSummaryQuery(
    undefined,
  );
  const summary = (data as DashboardResponse<CommuterSummary> | undefined)
    ?.data;

  if (isLoading) {
    return (
      <p className="type-body-sm text-(--muted)" role="status">
        Loading your dashboard…
      </p>
    );
  }

  if (isError || !summary) {
    return (
      <PageSection title="Could not load your dashboard">
        <p className="type-body-sm text-(--muted)">
          Something went wrong fetching your trips. Please try again.
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
      {profileComplete === false ? (
        <PageSection title="Finish setting up your account">
          <p className="type-body-sm text-(--muted)">
            Complete your profile so drivers and operators can reach you and
            your trips stay linked to your account.
          </p>
          <Link
            to="/auth/complete-registration"
            className="type-body-sm text-(--ink) underline underline-offset-4"
          >
            Complete registration
          </Link>
        </PageSection>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Next trip"
          value={
            summary.nextTrip
              ? formatTripTime(summary.nextTrip.startTime)
              : 'None booked'
          }
          sub={
            summary.nextTrip
              ? `Status: ${summary.nextTrip.status.replace('_', ' ').toLowerCase()}`
              : 'Plan a journey to get moving'
          }
          icon={<CalendarDays size={18} aria-hidden="true" />}
          actionHref="/travel"
          actionLabel="Plan a journey"
        />
        <StatCard
          label="Trips this week"
          value={summary.tripsThisWeek}
          sub={`${summary.completedTrips} completed all time`}
          icon={<Route size={18} aria-hidden="true" />}
          actionHref="/saved"
          actionLabel="View saved journeys"
          sparkValues={summary.dailyVolume.map((d) => d.count)}
          sparkLabel="Trips per day this week"
        />
        <StatCard
          label="Total trips"
          value={summary.totalTrips}
          sub="All trips linked to your account"
          icon={<History size={18} aria-hidden="true" />}
          actionHref="/saved"
          actionLabel="Review journeys"
        />
        <StatCard
          label="Completion rate"
          value={
            summary.totalTrips > 0
              ? `${Math.round((summary.completedTrips / summary.totalTrips) * 100)}%`
              : '—'
          }
          sub="Share of trips completed"
          icon={<CheckCircle2 size={18} aria-hidden="true" />}
        />
      </div>

      <PageSection
        title="Your week"
        description="Trips per day over the last 7 days."
        actions={
          <Link
            to="/travel"
            className="type-body-sm inline-flex items-center gap-1 text-(--ink) underline underline-offset-4"
          >
            Plan next trip <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      >
        <SeriesChart
          kind="bar"
          ariaLabel="Trips per day over the last 7 days"
          data={summary.dailyVolume.map((d) => ({
            name: d.day.slice(5),
            value: d.count,
          }))}
        />
      </PageSection>
    </div>
  );
};

export default CommuterDashboard;
