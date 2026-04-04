import Button from "@/components/inputs/Button";
import { Link } from "react-router-dom";
import { publicColors } from "./publicTheme";
import basisTransportLogo from "/logo.svg";

export interface PublicNavbarProps {
  variant?: "default" | "auth";
}

const PublicNavbar = ({ variant = "default" }: PublicNavbarProps) => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm"
      style={{
        backgroundColor: `${publicColors.bg}/80`,
        borderColor: `${publicColors.primary}15`,
      }}
    >
      <nav
        className="max-w-6xl mx-auto px-6 lg:px-8"
        aria-label="Public navigation"
      >
        <section className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 group">
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

          {!["auth"].includes(variant) && (
            <Button primary route="/dashboard">
              Open App
            </Button>
          )}
        </section>
      </nav>
    </header>
  );
};

export default PublicNavbar;
