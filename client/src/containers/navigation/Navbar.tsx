import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUserCircle,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLogout } from '@/states/slices/authSlice';
import { useAppSelector } from '@/states/hooks';

const Navbar = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const { token } = useAppSelector((state) => state.auth);

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="fixed top-0 left-0 w-full h-[9vh] bg-background/90 backdrop-blur border-b border-primary/10 shadow-sm z-[1000] transition-all duration-300 flex items-center">
      <nav
        className="w-full flex items-center justify-between px-6 md:px-12"
        aria-label="Main navigation"
      >
        <ul className="flex items-center gap-4 list-none p-0 m-0">
          <Link
            to={token ? '/dashboard' : '/'}
            onClick={() => {
              if (token) {
                navigate('/dashboard');
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-2 text-xl font-semibold text-primary tracking-wide select-none hover:text-primary/80 transition-colors duration-200"
          >
            <span className="text-2xl">🚌</span>
            <span>Basis Transport</span>
          </Link>
        </ul>
        <ul className="flex items-center gap-4 list-none p-0 m-0">
          <li className="relative">
            <Link
              to="#"
              className="p-2 px-[11px] rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none"
              aria-label="User profile"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={(e) => {
                e.preventDefault();
                setDropdownOpen((open) => !open);
              }}
              tabIndex={0}
              role="button"
            >
              <FontAwesomeIcon icon={faUser} size="sm" />
            </Link>
            {dropdownOpen && (
              <ul
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 animate-fade-in"
                role="menu"
                aria-label="User menu"
              >
                <li>
                  <Link
                    to="/account/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors rounded-md group"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/account/profile');
                      setDropdownOpen(false);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="text-primary/70 group-hover:text-primary"
                    />
                    <span className="font-medium">Profile</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-md group"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(setLogout());
                      window.location.href = '/auth/login';
                      setDropdownOpen(false);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      className="text-destructive/70 group-hover:text-destructive"
                    />
                    <span className="font-medium">Logout</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
