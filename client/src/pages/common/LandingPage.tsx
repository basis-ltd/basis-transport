import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BusFront,
  Footprints,
  MapPin,
  Navigation,
} from "lucide-react";
import { useState } from "react";
import PublicNavbar from "@/containers/public/PublicNavbar";
import PublicFooter from "@/containers/public/PublicFooter";
import { Seo } from "@/components/seo";
import LandingHeroForm from "./components/landing/LandingHeroForm";
import { useNetworkResource } from "@/features/journey/api";
import { requestLocation, travelUrl } from "@/features/journey/locations";
import { NetworkNotice } from "@/features/journey/JourneyShell";
import type { NetworkStatus } from "@/features/journey/types";
import "@/features/journey/journey.css";

export default function LandingPage() {
  const navigate = useNavigate(),
    { data: network } = useNetworkResource<NetworkStatus>("/network/status");
  const [error, setError] = useState(""),
    [locating, setLocating] = useState(false);
  const nearby = async () => {
    setLocating(true);
    setError("");
    try {
      const p = await requestLocation();
      navigate("/stops?lat=" + p.latitude + "&lng=" + p.longitude);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLocating(false);
    }
  };
  return (
    <div className="landing-page journey-page">
      <Seo
        title="Basis Transport | Find your way through Kigali"
        description="Find bus connections, explore routes, and know where to board. No account required."
        canonicalPath="/"
      />
      <PublicNavbar />
      <main className="landing-container">
        <section className="journey-hero">
          <div className="journey-hero-grid">
            <div>
              <p className="journey-eyebrow">
                Kigali, one connection at a time
              </p>
              <h1>
                Your way there.
                <br />
                <span>Stop by stop.</span>
              </h1>
              <p className="journey-hero-intro">
                Find the bus, the boarding point, and the changes along the way.
                Start with where you are going.
              </p>
              <LandingHeroForm onSearch={(a, b) => navigate(travelUrl(a, b))} />
              <div className="journey-actions">
                <button
                  className="journey-button secondary"
                  type="button"
                  disabled={locating}
                  onClick={() => void nearby()}
                >
                  <Navigation size={16} />
                  {locating ? "Finding you…" : "Find nearby stops"}
                </button>
              </div>
              {error && (
                <p className="journey-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <aside className="journey-hero-board">
              <p className="journey-eyebrow">Your public transport guide</p>
              <h2>A little clarity before you go.</h2>
              <p>
                Explore the network, check your boarding stop, and keep useful
                connections close.
              </p>
              <div className="journey-hero-links">
                <Link to="/routes">
                  <BusFront size={22} />
                  <span>
                    <strong>Explore bus routes</strong>
                    <small>
                      {network?.ready
                        ? network.routes + " lines in this dataset"
                        : "Published routes and directional patterns"}
                    </small>
                  </span>
                  <ArrowRight size={17} />
                </Link>
                <Link to="/stops">
                  <MapPin size={22} />
                  <span>
                    <strong>Find your boarding point</strong>
                    <small>
                      {network?.ready
                        ? network.stops + " named stops"
                        : "Stops, landmarks, and nearby connections"}
                    </small>
                  </span>
                  <ArrowRight size={17} />
                </Link>
                <Link to="/saved">
                  <Bookmark size={22} />
                  <span>
                    <strong>Keep your usual journeys</strong>
                    <small>Saved on your device. No sign-in needed.</small>
                  </span>
                  <ArrowRight size={17} />
                </Link>
              </div>
              <p className="journey-field-hint">
                Network guidance, not live arrivals. Confirm service before you
                travel.
              </p>
            </aside>
          </div>
          {network?.verification && network.sourceUrl ? (
            <NetworkNotice
              network={{
                verification: network.verification,
                sourceUrl: network.sourceUrl,
                validTo: network.validTo || null,
              }}
            />
          ) : network && !network.ready ? (
            <p className="journey-notice">{network.notice}</p>
          ) : null}
        </section>
        <section className="journey-how" id="how-it-works">
          <h2>From your first stop to your last.</h2>
          <div className="journey-how-grid">
            <article>
              <MapPin size={23} />
              <h3>Choose your places</h3>
              <p>
                Search by stop or landmark. Share your current location only
                when you want to.
              </p>
            </article>
            <article>
              <BusFront size={23} />
              <h3>Find a connection</h3>
              <p>
                Compare route numbers, walking distances, and changes. Open the
                stops along your route.
              </p>
            </article>
            <article>
              <Footprints size={23} />
              <h3>Follow the stops</h3>
              <p>
                Read where to board, where to change, and where to get off. Save
                the journey for next time.
              </p>
            </article>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
