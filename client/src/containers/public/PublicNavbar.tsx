import { Link, NavLink } from 'react-router-dom';
import basisTransportLogo from '/logo.svg';

export interface PublicNavbarProps {
  variant?: 'default' | 'auth';
}

/**
 * The one inverted slab at the top of the page. `invert-surface` swaps the
 * tokens locally rather than hand-painting ink and paper, so nav items, focus
 * rings, and ::selection all keep working inside the black bar without any
 * special-casing — and the same markup flips correctly in dark mode.
 */
const navItemClassName =
  'rounded-(--radius-pill) px-3 py-2.5 text-sm font-medium text-(--muted) transition-colors duration-200 ease-(--ease-flat) hover:bg-(--surface) hover:text-(--ink)';

const PublicNavbar = ({ variant = 'default' }: PublicNavbarProps) => {
  return (
    <header className="invert-surface sticky top-0 z-(--z-navbar)">
      <nav className="landing-container" aria-label="Public navigation">
        <section className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-(--radius-pill) text-(--ink)"
          >
            <img
              src={basisTransportLogo}
              alt="Basis Transport"
              className="size-7 brightness-0 invert"
            />
            <span className="text-base font-medium">Basis</span>
          </Link>

          {variant !== 'auth' ? (
            <div className="flex items-center gap-1">
              <Link to="/#how-it-works" className={navItemClassName}>
                How it works
              </Link>
              <NavLink
                to="/auth/login"
                className={`${navItemClassName} max-sm:hidden`}
              >
                Sign in
              </NavLink>
              <Link
                to="/auth/register"
                className="ml-2 inline-flex h-(--control-sm) items-center justify-center rounded-(--radius-control) bg-(--ink) px-4 text-sm font-medium text-(--paper) transition-colors duration-200 ease-(--ease-flat) hover:bg-[color-mix(in_oklab,var(--ink)_88%,var(--paper))] active:shadow-[var(--press-on-ink)_999px_999px_0_inset]"
              >
                Create account
              </Link>
            </div>
          ) : null}
        </section>
      </nav>
    </header>
  );
};

export default PublicNavbar;
