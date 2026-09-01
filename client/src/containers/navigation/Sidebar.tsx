import {
  faAnglesLeft,
  faBars,
  faChevronDown,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation } from 'react-router-dom';
import {
  getSidebarNavigationForUser,
  type NavigationItem,
} from '@/constants/sidebar.constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  closeMobileSidebar,
  setDesktopSidebarExpanded,
} from '@/states/slices/sidebarSlice';

const matchesPath = (pathname: string, targetPath: string) =>
  pathname === targetPath || pathname.startsWith(`${targetPath}/`);

const labelFade = { duration: 0.2, ease: 'easeOut' } as const;

const Sidebar = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { desktopExpanded, mobileOpen } = useAppSelector(
    (state) => state.sidebar,
  );
  const isDesktopViewport = useMediaQuery('(min-width: 768px)');
  const { user } = useAppSelector((state) => state.auth);
  const roleNames = useMemo(
    () =>
      user?.userRoles
        ?.map((userRole) => userRole.role?.name)
        .filter((roleName): roleName is string => Boolean(roleName)) ?? [],
    [user?.userRoles],
  );
  const sidebarNavItems = useMemo(
    () => getSidebarNavigationForUser(roleNames),
    [roleNames],
  );
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const sidebarExpanded = isDesktopViewport ? desktopExpanded : mobileOpen;
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (!sidebarExpanded) {
      setOpenCategories([]);
    }
  }, [sidebarExpanded]);

  useEffect(() => {
    if (!sidebarExpanded) return;

    const activeCategories = sidebarNavItems
      .filter((nav: NavigationItem) =>
        nav.subCategories?.some((subCategory) =>
          matchesPath(pathname, subCategory.path),
        ),
      )
      .map((nav: NavigationItem) => nav.title);

    if (activeCategories.length) {
      setOpenCategories((prev) => Array.from(new Set([...prev, ...activeCategories])));
    }
  }, [pathname, sidebarExpanded, sidebarNavItems]);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname && mobileOpen) {
      dispatch(closeMobileSidebar());
    }

    previousPathnameRef.current = pathname;
  }, [dispatch, mobileOpen, pathname]);

  useEffect(() => {
    if (isDesktopViewport && mobileOpen) {
      dispatch(closeMobileSidebar());
    }
  }, [dispatch, isDesktopViewport, mobileOpen]);

  useEffect(() => {
    if (isDesktopViewport || !mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch(closeMobileSidebar());
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, isDesktopViewport, mobileOpen]);

  useEffect(() => {
    if (isDesktopViewport || !mobileOpen) {
      return;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isDesktopViewport, mobileOpen]);

  const toggleCategory = useCallback((title: string) => {
    setOpenCategories((prev) =>
      prev.includes(title)
        ? prev.filter((category) => category !== title)
        : [...prev, title],
    );
  }, []);

  return (
    <motion.aside
      id="app-sidebar"
      initial={false}
      animate={isDesktopViewport ? { x: 0 } : { x: mobileOpen ? 0 : '-100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-[var(--navbar-height)] z-(--z-sidebar) flex h-[calc(100vh-var(--navbar-height))] w-[var(--mobile-sidebar-width)] flex-col border-r border-(--line) bg-(--paper) text-(--ink) transition-[width] duration-300 ease-in-out md:w-[var(--app-sidebar-width)]"
      aria-hidden={!isDesktopViewport && !mobileOpen}
    >
      <header
        className={`flex w-full px-4 pt-5 pb-4 ${
          isDesktopViewport
            ? desktopExpanded
            ? 'items-end justify-end'
            : 'flex-col items-center justify-center gap-3'
            : 'items-center justify-between gap-3'
        }`}
      >
        {isDesktopViewport ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              dispatch(setDesktopSidebarExpanded(!desktopExpanded));
            }}
            className="flex size-8 cursor-pointer items-center justify-center rounded-(--radius-control) text-(--muted) transition-colors duration-200 ease-(--ease-flat) hover:bg-(--surface) hover:text-(--ink)"
            aria-label={desktopExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <FontAwesomeIcon icon={desktopExpanded ? faAnglesLeft : faBars} className="size-3.5" />
          </button>
        ) : (
          <>
            <p className="type-label">Basis Transport</p>
            <button
              type="button"
              onClick={() => {
                dispatch(closeMobileSidebar());
              }}
              className="flex size-8 cursor-pointer items-center justify-center rounded-(--radius-control) text-(--muted) transition-colors duration-200 ease-(--ease-flat) hover:bg-(--surface) hover:text-(--ink)"
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={faXmark} className="size-3.5" />
            </button>
          </>
        )}
      </header>

      <div className="mx-4 mb-3">
        <div className="h-px bg-(--line)" />
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3">
        <ul className="flex flex-col gap-2">
          {sidebarNavItems.map((nav: NavigationItem) => {
            const selected = pathname === nav.path;
            const hasSubcategories =
              !!nav.subCategories && nav.subCategories.length > 0;
            const isSubcategoriesOpen = openCategories.includes(nav.title);
            const activeSubcategoryPath = nav.subCategories
              ?.filter((subCategory: NavigationItem) =>
                matchesPath(pathname, subCategory.path),
              )
              .sort(
                (left: NavigationItem, right: NavigationItem) =>
                  right.path.length - left.path.length,
              )[0]?.path;
            const isSubcategoryActive = Boolean(activeSubcategoryPath);
            const isActive = selected || isSubcategoryActive;

            return (
              <li key={nav.title} className="flex flex-col">
                <Link
                  to={nav.path}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-md text-sm font-medium transition-colors duration-200 ease-(--ease-flat)
                    ${sidebarExpanded ? 'px-3 py-2.5' : 'justify-center p-2.5'}
                    ${
                      isActive
                        ? 'bg-(--ink) text-(--paper)'
                        : 'text-(--muted) hover:bg-(--surface) hover:text-(--ink)'
                    }
                  `}
                  onClick={(e) => {
                    if (hasSubcategories) {
                      e.preventDefault();
                      if (isDesktopViewport && !desktopExpanded) {
                        dispatch(setDesktopSidebarExpanded(true));
                        return;
                      }
                      toggleCategory(nav.title);
                      return;
                    }

                    if (isDesktopViewport && !desktopExpanded) {
                      dispatch(setDesktopSidebarExpanded(true));
                    }

                    if (!isDesktopViewport) {
                      dispatch(closeMobileSidebar());
                    }
                  }}
                  title={nav.title}
                >
                  <FontAwesomeIcon
                    icon={nav.icon}
                    className={`size-4 shrink-0 ${
                      isActive ? 'text-(--accent-line)' : 'text-(--accent-ink)'
                    }`}
                  />

                  {sidebarExpanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={labelFade}
                      className="whitespace-nowrap text-sm font-medium"
                    >
                      {nav.title}
                    </motion.span>
                  )}

                  {hasSubcategories && sidebarExpanded && (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`ml-auto size-3 transition-transform duration-200 ease-(--ease-glide) ${
                        isSubcategoriesOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {hasSubcategories && isSubcategoriesOpen && sidebarExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="my-1 overflow-hidden"
                    >
                      <ul className="ml-[14px] flex flex-col gap-1.5 border-l border-(--line) py-1.5 pl-2 pr-1">
                        {nav.subCategories?.map((subCategory: NavigationItem) => {
                          const isSubActive =
                            activeSubcategoryPath === subCategory.path;

                          return (
                            <li key={subCategory.title}>
                              <Link
                                to={subCategory.path}
                                className={`group flex items-center gap-2.5 rounded-(--radius-pill) px-3 py-2 text-sm font-normal transition-colors duration-200 ease-(--ease-flat) ${
                                  isSubActive
                                    ? 'bg-(--ink) text-(--paper)'
                                    : 'text-(--muted) hover:bg-(--surface) hover:text-(--ink)'
                                }`}
                                onClick={() => {
                                  if (!isDesktopViewport) {
                                    dispatch(closeMobileSidebar());
                                  }
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={subCategory.icon}
                                  className={`size-3.5 shrink-0 ${
                                    isSubActive
                                      ? 'text-(--accent-line)'
                                      : 'text-(--accent-ink)'
                                  }`}
                                />
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={labelFade}
                                  className="whitespace-nowrap text-sm font-medium"
                                >
                                  {subCategory.title}
                                </motion.span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="mt-auto px-4 py-6">
        <div className="mb-3 h-px bg-(--line)" />
        {sidebarExpanded ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={labelFade}
            className="type-meta text-center"
          >
            Basis Transport
          </motion.p>
        ) : (
          <figure className="flex justify-center">
            <span
              className="block size-2 rounded-(--radius-pill) bg-(--line-strong)"
              aria-hidden
            />
          </figure>
        )}
      </footer>
    </motion.aside>
  );
};

export default Sidebar;
