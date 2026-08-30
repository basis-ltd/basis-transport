import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faRightFromBracket,
  faUser,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { panelClassName, panelItemClassName } from '@/components/inputs/control';
import useConfirm from '@/components/feedback/ConfirmDialog';
import { openMobileSidebar } from '@/states/slices/sidebarSlice';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { useLogout } from '@/usecases/auth/auth.hooks';
import basisTransportLogo from '/logo.svg';

/**
 * The user menu is Radix by way of shadcn rather than the hand-rolled dropdown
 * that used to live here: that version tracked outside clicks with its own
 * mousedown listener, and its items were anchors to "#" with `role="button"`,
 * so the menu was unreachable by keyboard and left dead stops in the tab order.
 */
const Navbar = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { mobileOpen } = useAppSelector((state) => state.sidebar);
  const logout = useLogout();
  const navigate = useNavigate();
  const { confirm, confirmDialog } = useConfirm();

  const onLogout = async () => {
    const agreed = await confirm({
      title: 'Sign out?',
      description:
        'You will need to sign in again to reach your trips, cards, and saved routes.',
      confirmLabel: 'Sign out',
      icon: faRightFromBracket,
      destructive: true,
    });

    if (agreed) {
      void logout();
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-(--z-navbar) w-full border-b border-(--line) bg-(--paper)">
      <nav className="mx-auto px-6 lg:px-8" aria-label="Main navigation">
        <section className="flex h-[var(--navbar-height)] items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex size-9 cursor-pointer items-center justify-center rounded-(--radius-control) text-(--muted) transition-colors duration-200 ease-(--ease-flat) hover:bg-(--surface) hover:text-(--ink) md:hidden"
              onClick={() => dispatch(openMobileSidebar())}
              aria-label="Open sidebar"
              aria-controls="app-sidebar"
              aria-expanded={mobileOpen}
            >
              <FontAwesomeIcon icon={faBars} className="size-4" />
            </button>

            <Link
              to={token ? '/saved' : '/'}
              className="flex select-none items-center gap-2 rounded-(--radius-control) text-(--ink) outline-none focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
            >
              <img src={basisTransportLogo} alt="" aria-hidden="true" className="size-6" />
              <span className="text-base font-medium">Basis</span>
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="User menu"
              className="flex size-9 cursor-pointer items-center justify-center rounded-(--radius-pill) bg-(--surface) text-(--ink) transition-colors duration-200 ease-(--ease-flat) outline-none hover:bg-(--surface-hover) focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
            >
              <FontAwesomeIcon icon={faUser} className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`${panelClassName} w-52`}>
              <DropdownMenuItem
                className={panelItemClassName}
                onSelect={() => navigate('/account/profile')}
              >
                <FontAwesomeIcon icon={faUserCircle} className="size-3.5" aria-hidden="true" />
                Profile
              </DropdownMenuItem>
              {/* Signing out is destructive, so it says so and carries its icon —
                  the hue is not what makes it legible. */}
              <DropdownMenuItem
                className={panelItemClassName}
                // The confirmation is a sibling of this menu, not a child, so
                // the menu can close normally. Opening on the next tick lets
                // Radix finish returning focus to the trigger before the
                // dialog claims it.
                onSelect={() => window.setTimeout(() => void onLogout(), 0)}
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="size-3.5" aria-hidden="true" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
      </nav>
      {confirmDialog}
    </header>
  );
};

export default Navbar;
