import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, useAnimation } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { RootState, AppDispatch } from '../../states/store';
import {
  faBars,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { SIDEBAR_NAV_ITEMS } from '@/constants/sidebar.constants';
import { setSidebarOpen } from '@/states/slices/sidebarSlice';
import { User } from '@/types/user.type';

const Sidebar = () => {
  const { pathname } = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const { isOpen } = useSelector((state: RootState) => state.sidebar);
  const { user } = useSelector((state: RootState) => state.auth) as {
    user: User;
  };
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const controlText = useAnimation();

  const showMore = useCallback(() => {
    controlText.start({
      opacity: 1,
      display: 'block',
      transition: { delay: 0.1, duration: 0.2 },
    });
  }, [controlText]);

  const showLess = useCallback(() => {
    controlText.start({
      opacity: 0,
      display: 'none',
      transition: { duration: 0.1 },
    });
  }, [controlText]);

  useEffect(() => {
    if (isOpen) {
      showMore();
    } else {
      showLess();
      setOpenCategories([]);
    }
  }, [isOpen, showMore, showLess]);

  const toggleCategory = useCallback((title: string) => {
    setOpenCategories((prev) =>
      prev.includes(title)
        ? prev.filter((cat) => cat !== title)
        : [...prev, title]
    );
  }, []);

  return (
    <motion.aside
      className={`fixed top-[9vh] shadow-md left-0 h-[91vh] flex flex-col 
                 bg-background transition-all duration-300 ease-in-out 
                 ${isOpen ? 'z-[999]' : 'z-10'}
                 ${
                   isOpen
                     ? 'w-[60vw] sm:w-[40vw] md:w-[20vw] shadow-xl p-4'
                     : 'w-[10vw] md:w-[5vw] p-2 shadow-lg'
                 } 
                 md:p-4 md:shadow-none md:z-auto`}
    >
      <header
        className={`flex items-center w-full mb-4 
                   ${isOpen ? 'justify-end pr-0' : 'justify-center pt-2'} 
                   md:justify-end md:pr-0 md:pt-0`}
      >
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            dispatch(setSidebarOpen(!isOpen));
          }}
          className={`cursor-pointer p-1 px-[8.2px] rounded-full bg-primary text-white hover:bg-primary/80 transition-colors duration-200 focus:outline-none focus:ring-opacity-50 ${
            !isOpen ? 'mx-auto' : ''
          }`}
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <FontAwesomeIcon icon={faBars} />
        </Link>
      </header>

      <ul
        className={`flex flex-col items-start w-full gap-2 ${
          isOpen ? '' : 'overflow-hidden'
        }`}
      >
        {SIDEBAR_NAV_ITEMS.filter((nav) => {
          if (!nav.roles) {
            return true;
          }
          const userRoles =
            user?.userRoles?.map((userRole) => userRole.role?.name) || [];
          return nav.roles.some((role) => userRoles.includes(role));
        }).map((nav, index) => {
          const selected = pathname.includes(nav.path);
          const subcategoriesIsOpen = openCategories.includes(nav.title);
          const isSubcategoryActive = nav.subcategories?.some((sub) =>
            pathname.startsWith(sub.path)
          );
          const isLinkActive = selected || isSubcategoryActive;

          return (
            <li key={index} className="w-full flex flex-col items-start">
              <Link
                to={nav.path}
                className={`flex w-full items-center gap-4 font-medium text-[13px] ease-in-out duration-200 rounded-lg 
                            ${isOpen ? 'px-4 py-3' : 'p-3 justify-center'}
                            hover:bg-primary/5 hover:text-primary
                            ${
                              isLinkActive
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-gray-700'
                            }`}
                onClick={(e) => {
                  if (nav.subcategories) {
                    e.preventDefault();
                    if (!isOpen) {
                      dispatch(setSidebarOpen(true));
                    } else {
                      toggleCategory(nav.title);
                    }
                  } else {
                    if (!isOpen) {
                      dispatch(setSidebarOpen(true));
                    }
                  }
                }}
                title={nav.title}
              >
                <FontAwesomeIcon
                  icon={nav.icon}
                  className={`text-xl flex items-center 
                              ${
                                isLinkActive ? 'text-primary' : 'text-gray-600'
                              }`}
                />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={isOpen ? controlText : { opacity: 0 }}
                  className="font-medium whitespace-nowrap"
                >
                  {nav.title}
                </motion.span>
                {nav.subcategories && isOpen && (
                  <FontAwesomeIcon
                    icon={subcategoriesIsOpen ? faChevronUp : faChevronDown}
                    className="ml-auto text-base text-gray-400"
                  />
                )}
              </Link>
              {nav.subcategories && subcategoriesIsOpen && isOpen && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="pl-4 pr-4 w-full flex flex-col gap-1 my-2"
                >
                  {nav.subcategories.map((sub, subIndex) => {
                    const isSubLinkActive = pathname.startsWith(sub.path);
                    return (
                      <li key={subIndex}>
                        <Link
                          to={sub.path}
                          className={`flex items-center w-full gap-3 px-4 py-3 font-medium text-xs ease-in-out duration-200 rounded-md 
                                      hover:bg-primary/5 hover:text-primary
                                      ${
                                        isSubLinkActive
                                          ? 'bg-primary/10 text-primary font-semibold'
                                          : 'text-gray-600'
                                      }`}
                        >
                          <FontAwesomeIcon
                            icon={sub?.icon}
                            className={`text-base ${
                              isSubLinkActive ? 'text-primary' : 'text-gray-500'
                            }`}
                          />
                          <motion.span
                            animate={isOpen ? controlText : { opacity: 0 }}
                            className="font-medium whitespace-nowrap"
                          >
                            {sub.title}
                          </motion.span>
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </li>
          );
        })}
      </ul>
    </motion.aside>
  );
};

export default Sidebar;
