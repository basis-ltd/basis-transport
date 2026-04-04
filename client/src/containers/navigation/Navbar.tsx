import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserCircle,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, useMemo } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useDispatch } from "react-redux";
import { setLogout } from "@/states/slices/authSlice";
import { useAppSelector } from "@/states/hooks";
import { publicColors } from "@/containers/public/publicTheme";
import basisTransportLogo from "/logo.svg";

type UserMenuItem = {
  id: string;
  label: string;
  icon: IconDefinition;
  to: string;
  variant: "default" | "danger";
  action: () => void;
};

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

  const userMenuItems = useMemo<UserMenuItem[]>(
    () => [
      {
        id: "profile",
        label: "Profile",
        icon: faUserCircle,
        to: "/account/profile",
        variant: "default",
        action: () => {
          navigate("/account/profile");
          setDropdownOpen(false);
        },
      },
      {
        id: "logout",
        label: "Logout",
        icon: faRightFromBracket,
        to: "#",
        variant: "danger",
        action: () => {
          dispatch(setLogout());
          window.location.href = "/auth/login";
          setDropdownOpen(false);
        },
      },
    ],
    [dispatch, navigate]
  );

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
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[1000] w-full border-b backdrop-blur-sm transition-all duration-300 bg-background/80"
      style={{ borderColor: `${publicColors.primary}15` }}
    >
      <nav
        className="mx-auto px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <section className="flex justify-between items-center h-[55px]">
          <ul className="flex items-center gap-4 list-none p-0 m-0">
            <Link
              to={token ? "/dashboard" : "/"}
              onClick={() => {
                if (token) {
                  navigate("/dashboard");
                } else {
                  navigate("/");
                }
              }}
              className="flex items-center gap-2 group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background select-none"
            >
              <img
                src={basisTransportLogo}
                alt="Basis Transport Logo"
                className="w-6 h-6 text-[12px]"
              />
              <span
                className="text-base font-normal"
                style={{ color: publicColors.primary }}
              >
                Basis
              </span>
            </Link>
          </ul>
          <ul className="flex items-center gap-4 list-none p-0 m-0">
            <li className="relative">
              <Link
                to="#"
                className="py-[6px] px-[10px] rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                <FontAwesomeIcon icon={faUser} className="text-[10px] lg:text-[11px]" />
              </Link>
              {dropdownOpen && (
                <ul
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-40 bg-white border border-primary/10 rounded-lg shadow-lg py-2 z-50 animate-fade-in"
                  role="menu"
                  aria-label="User menu"
                >
                  {userMenuItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.to}
                        className={`flex items-center gap-2 text-[13px] px-4 py-2 text-foreground font-light transition-colors duration-200 ease-in-out rounded-md group ${
                          item.variant === "danger"
                            ? "hover:bg-destructive/10 hover:text-destructive"
                            : "hover:bg-primary/10 hover:text-primary"
                        }`}
                        role="menuitem"
                        onClick={(e) => {
                          e.preventDefault();
                          item.action();
                        }}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={
                            item.variant === "danger"
                              ? "text-destructive/70 group-hover:text-destructive"
                              : "text-primary/70 group-hover:text-primary"
                          }
                        />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </section>
      </nav>
    </header>
  );
};

export default Navbar;
