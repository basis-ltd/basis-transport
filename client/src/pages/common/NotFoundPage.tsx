import {
  faArrowLeft,
  faBus,
  faCreditCard,
  faGaugeHigh,
  faHouse,
  faLocationDot,
  faRoute,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/inputs/Button';
import { Seo } from '@/components/seo';
import AppLayout from '@/containers/navigation/AppLayout';
import PublicFooter from '@/containers/public/PublicFooter';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import { useAppSelector } from '@/states/hooks';

/**
 * The line diagram.
 *
 * A wrong address in a transport app is a stop that is not on any route, so
 * that is what this draws: a real origin, the line running out, and a terminus
 * left hollow and dashed. Dashed already means "provisional, not arrived" on
 * the status chips, so this borrows the system's own vocabulary rather than
 * inventing an illustration — and the label beside it carries the one piece of
 * information the reader actually needs, which is the path that failed.
 */
const MissingStopDiagram = () => (
  <svg
    viewBox="0 0 420 48"
    className="h-12 w-full max-w-[420px]"
    role="presentation"
    aria-hidden="true"
  >
    {/* The stretch that exists. */}
    <line
      x1="10"
      y1="24"
      x2="176"
      y2="24"
      stroke="var(--ink)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* The stretch that does not. The line runs a long way into nothing
        before the stop that was asked for, which is the whole point. */}
    <line
      x1="188"
      y1="24"
      x2="396"
      y2="24"
      stroke="var(--line-strong)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="2 9"
    />
    <circle cx="10" cy="24" r="7" fill="var(--accent-ink)" />
    <circle
      cx="408"
      cy="24"
      r="9"
      fill="var(--paper)"
      stroke="var(--line-strong)"
      strokeWidth="2.5"
      strokeDasharray="4 4"
    />
  </svg>
);

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, token } = useAppSelector((state) => state.auth);
  const isSignedIn = Boolean(user && token);

  /* Only routes that exist. A "try one of these" list that 404s in turn is
     worse than no list at all. */
  const destinations = isSignedIn
    ? [
        { to: '/saved', label: 'Saved journeys', icon: faGaugeHigh },
        { to: '/routes', label: 'Bus routes', icon: faBus },
        { to: '/travel', label: 'Plan a journey', icon: faRoute },
        { to: '/account/transport-cards', label: 'My cards', icon: faCreditCard },
      ]
    : [
        { to: '/', label: 'Home', icon: faHouse },
        { to: '/travel', label: 'Plan a trip', icon: faRoute },
        { to: '/auth/login', label: 'Sign in', icon: faLocationDot },
      ];

  const content = (
    <section className="landing-enter mx-auto flex w-full max-w-xl flex-col items-start gap-6 py-10">
      <div className="flex w-full flex-col gap-3">
        <MissingStopDiagram />
        <p className="type-meta flex flex-wrap items-baseline gap-x-2">
          <span>Line ends at</span>
          <span className="tabular break-all text-(--ink)">{pathname}</span>
        </p>
      </div>

      <hgroup className="flex flex-col gap-2">
        <h1 className="type-h2 text-(--ink)">That stop isn’t on any route.</h1>
        <p className="type-body max-w-[52ch] text-(--muted)">
          This address doesn’t match a page in Basis. It may have moved, or the
          link you followed may be incomplete.
        </p>
      </hgroup>

      <div className="flex flex-wrap items-center gap-3">
        <Button primary route={isSignedIn ? '/saved' : '/'}>
          {isSignedIn ? 'Go to dashboard' : 'Go to home'}
        </Button>
        <Button
          type="button"
          variant="breadcrumb"
          icon={faArrowLeft}
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
      </div>

      <nav aria-label="Other places to go" className="flex w-full flex-col gap-3">
        <p className="type-meta">Or pick up the route here</p>
        <ul className="flex flex-wrap gap-2">
          {destinations.map((destination) => (
            <li key={destination.to}>
              <Link
                to={destination.to}
                className="inline-flex h-(--control-sm) items-center gap-2 rounded-(--radius-pill) border border-(--line) px-3.5 text-sm text-(--ink) outline-none transition-colors duration-200 ease-(--ease-flat) hover:border-(--ink) focus-visible:border-(--ink) focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
              >
                <FontAwesomeIcon
                  icon={destination.icon}
                  className="size-3.5 text-(--accent-ink)"
                  aria-hidden="true"
                />
                {destination.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );

  const seo = (
    <Seo
      title="Page not found | Basis Transport"
      description="This address doesn’t match a page in Basis Transport."
      canonicalPath="/"
      noIndex
      openGraph={false}
    />
  );

  /* Signed in, the miss happened inside the app, so it keeps the app frame —
     the sidebar is the fastest way out, and dropping it would strand the
     reader. Signed out, it wears the public shell for the same reason. */
  if (isSignedIn) {
    return (
      <>
        {seo}
        <AppLayout>{content}</AppLayout>
      </>
    );
  }

  return (
    <>
      {seo}
      <PublicLayout>
        <PublicNavbar />
        <main className="landing-page landing-paper">
          <div className="landing-container flex min-h-[60vh] items-center">
            {content}
          </div>
        </main>
        <PublicFooter />
      </PublicLayout>
    </>
  );
};

export default NotFoundPage;
