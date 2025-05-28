import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLUListElement>(null);

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
    <header className="fixed top-0 left-0 w-full h-[9vh] bg-background shadow z-[1000] transition-all duration-300 flex items-center">
      <nav
        className="w-full flex items-center justify-between px-6 md:px-12"
        aria-label="Main navigation"
      >
        <ul className="flex items-center gap-4 list-none p-0 m-0">
          <Link
            to="/"
            className="text-xl font-bold text-primary tracking-wide select-none"
          >
            Basis Transport
          </Link>
        </ul>
        <ul className="flex items-center gap-4 list-none p-0 m-0">
          <li className="relative">
            <Link
              to="#"
              className="p-2 px-[11px] rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none"
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
                    to="/user/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      setDropdownOpen(false);
                    }}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      setDropdownOpen(false);
                    }}
                  >
                    Logout
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
