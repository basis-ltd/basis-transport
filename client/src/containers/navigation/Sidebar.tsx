import {
  faAnglesLeft,
  faBars,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation } from 'react-router-dom';
import {
  getSidebarNavigationForUser,
  type NavigationItem,
} from '@/constants/sidebar.constants';
import { setSidebarOpen } from '@/states/slices/sidebarSlice';
import { useAppDispatch, useAppSelector } from '@/states/hooks';

const matchesPath = (pathname: string, targetPath: string) =>
  pathname === targetPath || pathname.startsWith(`${targetPath}/`);

const labelFade = { duration: 0.2, ease: 'easeOut' } as const;

const Sidebar = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { isOpen: sidebarOpen } = useAppSelector(
    (state) => state.sidebar,
  );
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

  useEffect(() => {
    if (!sidebarOpen) {
      setOpenCategories([]);
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;

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
  }, [pathname, sidebarOpen, sidebarNavItems]);

  const toggleCategory = useCallback((title: string) => {
    setOpenCategories((prev) =>
      prev.includes(title)
        ? prev.filter((category) => category !== title)
        : [...prev, title],
    );
  }, []);

  return (
    <motion.aside
      className={`fixed left-0 top-[clamp(55px,8vh,55px)] z-40 h-[calc(100vh-clamp(55px,8vh,55px))] flex flex-col bg-background-secondary text-foreground transition-all duration-300 ease-in-out shadow-sm
        ${
          sidebarOpen
            ? 'w-[18vw] min-w-[220px] max-w-[260px]'
            : 'w-[12vw] min-w-[60px] max-w-[80px]'
        }
      `}
    >
      <header
        className={`flex w-full px-4 pt-5 pb-4 ${
          sidebarOpen
            ? 'items-end justify-end'
            : 'flex-col items-center justify-center gap-3'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            dispatch(setSidebarOpen(!sidebarOpen));
          }}
          className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-md bg-primary/10 text-primary transition-all duration-200 ease-in-out hover:bg-primary/15 hover:text-primary"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <FontAwesomeIcon
            icon={sidebarOpen ? faAnglesLeft : faBars}
            className="text-[12px] cursor-pointer"
          />
        </button>
      </header>

      <div className="mx-4 mb-3">
        <div className="h-px bg-primary/10" />
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
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-md text-[12px] font-light leading-tight transition-all duration-200 ease-in-out
                    ${sidebarOpen ? 'px-3 py-3' : 'justify-center p-3'}
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-secondary hover:bg-primary/5 hover:text-primary'
                    }
                  `}
                  onClick={(e) => {
                    if (hasSubcategories) {
                      e.preventDefault();
                      if (!sidebarOpen) {
                        dispatch(setSidebarOpen(true));
                        return;
                      }
                      toggleCategory(nav.title);
                      return;
                    }

                    if (!sidebarOpen) {
                      dispatch(setSidebarOpen(true));
                    }
                  }}
                  title={nav.title}
                >
                  <FontAwesomeIcon
                    icon={nav.icon}
                    className={`text-[15px] flex-shrink-0 transition-colors duration-200 ease-in-out ${
                      isActive
                        ? 'text-primary'
                        : 'text-secondary group-hover:text-primary'
                    }`}
                  />

                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={labelFade}
                      className="whitespace-nowrap text-[12px] font-light leading-tight"
                    >
                      {nav.title}
                    </motion.span>
                  )}

                  {hasSubcategories && sidebarOpen && (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`ml-auto text-[10px] text-secondary/60 transition-transform duration-300 ease-in-out ${
                        isSubcategoriesOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {hasSubcategories && isSubcategoriesOpen && sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="my-1 overflow-hidden"
                    >
                      <ul className="ml-[14px] flex flex-col gap-1.5 border-l border-primary/10 py-1.5 pl-2 pr-1">
                        {nav.subCategories?.map((subCategory: NavigationItem) => {
                          const isSubActive =
                            activeSubcategoryPath === subCategory.path;

                          return (
                            <li key={subCategory.title}>
                              <Link
                                to={subCategory.path}
                                className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] font-light leading-tight transition-all duration-200 ease-in-out ${
                                  isSubActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-secondary hover:bg-primary/5 hover:text-primary'
                                }`}
                              >
                                <FontAwesomeIcon
                                  icon={subCategory.icon}
                                  className={`text-[12px] flex-shrink-0 ${
                                    isSubActive
                                      ? 'text-primary'
                                      : 'text-secondary/70 group-hover:text-primary'
                                  }`}
                                />
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={labelFade}
                                  className="whitespace-nowrap text-[12px] font-light leading-tight"
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
        <div className="mb-3 h-px bg-primary/10" />
        {sidebarOpen ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={labelFade}
            className="text-center text-[12px] font-light leading-tight uppercase tracking-wide text-secondary/50"
          >
            Basis Transport
          </motion.p>
        ) : (
          <figure className="flex justify-center">
            <span
              className="block h-2 w-2 rounded-md bg-primary/15"
              aria-hidden
            />
          </figure>
        )}
      </footer>
    </motion.aside>
  );
};

export default Sidebar;
