import { Link } from 'react-router-dom';
import {
  Activity,
  CreditCard,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { useGetOverviewSummaryQuery } from '@/api/queries/apiQuerySlice';
import type { DashboardResponse, OverviewSummary } from '@/types/dashboard.type';
import { PageSection } from '@/components/layout/PageShell';
import DonutChart from '@/components/charts/DonutChart';
import SeriesChart from '@/components/charts/SeriesChart';
import StatCard from './StatCard';

const OpsDashboard = () => {
  const { data, isLoading, isError, refetch } = useGetOverviewSummaryQuery(
    undefined,
  );
  const summary = (data as DashboardResponse<OverviewSummary> | undefined)
    ?.data;

  if (isLoading) {
    return (
      <p className="type-body-sm text-(--muted)" role="status">
        Loading operations overview…
      </p>
    );
  }

  if (isError || !summary) {
    return (
      <PageSection title="Could not load the overview">
        <p className="type-body-sm text-(--muted)">
          Something went wrong fetching platform stats. Please try again.
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

  const totalTrips = summary.tripsByStatus.reduce((n, s) => n + s.count, 0);

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Live trips"
          value={summary.activeTrips}
          sub={`of ${totalTrips} total trips`}
          icon={<Activity size={18} aria-hidden="true" />}
          actionHref="/admin/network"
          actionLabel="Open network admin"
        />
        <StatCard
          label="Total riders"
          value={summary.totalUsers}
          sub="Registered accounts"
          icon={<Users size={18} aria-hidden="true" />}
          actionHref="/users"
          actionLabel="Manage users"
        />
        <StatCard
          label="Incomplete registrations"
          value={summary.incompleteRegistrations}
          sub="Accounts stuck mid-onboarding"
          icon={<UserX size={18} aria-hidden="true" />}
          actionHref="/users"
          actionLabel="Review users"
        />
        <StatCard
          label="Transport cards"
          value={summary.transportCards}
          sub="Cards issued on the platform"
          icon={<CreditCard size={18} aria-hidden="true" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PageSection
          title="Trips by status"
          description="Live fleet state across every trip."
        >
          {summary.tripsByStatus.length === 0 ? (
            <p className="type-body-sm text-(--muted)">No trips yet.</p>
          ) : (
            <DonutChart
              ariaLabel="Trips grouped by status"
              centerValue={String(totalTrips)}
              centerLabel="total trips"
              data={summary.tripsByStatus.map((s) => ({
                name: s.status.replace('_', ' ').toLowerCase(),
                value: s.count,
              }))}
            />
          )}
        </PageSection>

        <PageSection
          title="New riders"
          description="Signups per day over the last 14 days."
          actions={
            <Link
              to="/users"
              className="type-body-sm inline-flex items-center gap-1 text-(--ink) underline underline-offset-4"
            >
              <UserPlus size={14} aria-hidden="true" /> Manage users
            </Link>
          }
        >
          <SeriesChart
            kind="area"
            ariaLabel="Signups per day over the last 14 days"
            data={summary.signupsDaily.map((d) => ({
              name: d.day.slice(5),
              value: d.count,
            }))}
          />
        </PageSection>
      </div>

      <PageSection
        title="Trip volume"
        description="User trips per day over the last 14 days."
      >
        <SeriesChart
          kind="bar"
          ariaLabel="User trips per day over the last 14 days"
          data={summary.userTripsDaily.map((d) => ({
            name: d.day.slice(5),
            value: d.count,
          }))}
        />
      </PageSection>
    </div>
  );
};

export default OpsDashboard;
