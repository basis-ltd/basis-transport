import type { ReactNode } from "react";
import { Info } from "lucide-react";
import BackButton from "@/components/inputs/BackButton";
import Button from "@/components/inputs/Button";
import PublicNavbar from "@/containers/public/PublicNavbar";
import PublicFooter from "@/containers/public/PublicFooter";
import { Seo } from "@/components/seo";
import type { NetworkMetadata } from "./types";
import "@/styles/landingPage.css";
import "./journey.css";

export function NetworkNotice({
  network,
}: {
  network?: Pick<NetworkMetadata, "verification" | "sourceUrl" | "validTo">;
}) {
  if (!network) return null;
  return (
    <aside
      className={`journey-notice ${network.verification !== "verified" ? "is-historic" : ""}`}
    >
      <Info size={17} aria-hidden="true" />
      <p>
        {network.verification === "historic"
          ? "Historic network · internal beta. These routes were surveyed in 2019 and may have changed."
          : network.verification === "unverified"
            ? "Unverified network · confirm stops and services locally."
            : "Network directions · live arrivals are not available."}{" "}
        <a href={network.sourceUrl} target="_blank" rel="noreferrer">
          View source
        </a>
      </p>
    </aside>
  );
}
export function LoadState({
  loading,
  error,
  retry,
  className,
}: {
  loading: boolean;
  error?: string;
  retry?: () => void;
  className?: string;
}) {
  if (error)
    return (
      <div className="journey-empty" role="alert">
        <h2>We couldn’t load this information</h2>
        <p>{error}</p>
        {retry && (
          <Button type="button" onClick={retry}>
            Try again
          </Button>
        )}
      </div>
    );
  if (loading)
    return (
      <div
        role="status"
        aria-label="Loading"
        className={`journey-skeletons ${className || ""}`}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="journey-skeleton" />
        ))}
      </div>
    );
  return null;
}
export default function JourneyShell({
  title,
  description,
  children,
  path,
  back = true,
  compact = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  path: string;
  back?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="landing-page journey-page">
      <Seo
        title={`${title} | Basis Transport`}
        description={
          description ||
          "Plan a journey, explore bus routes, and find stops. No account required."
        }
        canonicalPath={path}
        noIndex={
          path === "/travel" || path === "/saved" || path.startsWith("/admin")
        }
      />
      <PublicNavbar />
      <main className="landing-container journey-main">
        {back && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <BackButton route="/">Back to journey search</BackButton>
          </nav>
        )}
        <header
          className={
            compact
              ? "journey-heading journey-heading--compact"
              : "journey-heading"
          }
        >
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </header>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
