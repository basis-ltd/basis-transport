import { useAppSelector } from '@/states/hooks';
import { Seo } from '@/components/seo';
import { PageBody, PageHeader } from '@/components/layout/PageShell';
import { useDashboardRole } from '@/usecases/dashboard/dashboard.hooks';
import CommuterDashboard from '@/components/dashboard/CommuterDashboard';
import DriverDashboard from '@/components/dashboard/DriverDashboard';
import OpsDashboard from '@/components/dashboard/OpsDashboard';

const HEADERS = {
  overview: {
    eyebrow: 'Operations',
    title: 'Platform overview',
    description:
      'Live fleet state, rider growth, and the accounts that need attention.',
  },
  driver: {
    eyebrow: 'Driver',
    title: "Today's assignments",
    description: 'Your current trip and everything starting today.',
  },
  commuter: {
    eyebrow: 'My travel',
    title: 'Your dashboard',
    description: 'Your next trip, your week, and where to go next.',
  },
} as const;

const DashboardPage = () => {
  const role = useDashboardRole();
  const name = useAppSelector((s) => s.auth.user?.name);
  const header = HEADERS[role];

  return (
    <>
      <Seo
        title="Dashboard | Basis Transport"
        description="Your Basis Transport dashboard: upcoming trips, travel activity, and live platform operations."
        canonicalPath="/dashboard"
      />
      <PageBody>
        <PageHeader
          eyebrow={header.eyebrow}
          title={name ? `${header.title} — ${name}` : header.title}
          description={header.description}
        />
        {role === 'overview' ? (
          <OpsDashboard />
        ) : role === 'driver' ? (
          <DriverDashboard />
        ) : (
          <CommuterDashboard />
        )}
      </PageBody>
    </>
  );
};

export default DashboardPage;
