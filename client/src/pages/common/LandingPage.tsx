import { useNavigate } from "react-router-dom";
import { BusFront, Footprints, MapPin } from "lucide-react";
import { useState } from "react";
import PublicNavbar from "@/containers/public/PublicNavbar";
import PublicFooter from "@/containers/public/PublicFooter";
import { Seo } from "@/components/seo";
import LandingHeroForm from "./components/landing/LandingHeroForm";
import { useNetworkResource } from "@/features/journey/api";
import { requestLocation, travelUrl } from "@/features/journey/locations";
import { NetworkNotice } from "@/features/journey/JourneyShell";
import LandingJourneyMap from "./components/landing/LandingJourneyMap";
import type { JourneyLocation } from "@/features/journey/types";
import type { NetworkStatus } from "@/features/journey/types";
import "@/styles/landingPage.css";
import "@/features/journey/journey.css";

export default function LandingPage() {
  const navigate = useNavigate(),
    { data: network } = useNetworkResource<NetworkStatus>("/network/status");
  const [endpoints, setEndpoints] = useState<{
    origin?: JourneyLocation;
    destination?: JourneyLocation;
  }>({});
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
        <section className="journey-hero grid gap-4">
          <div className="journey-hero-grid">
            <div className="journey-hero-copy landing-enter">
              <div className="journey-hero-headline">
                <h1 className="landing-display text-balance">
                  Your way there.
                  <br />
                  <span>Stop by stop.</span>
                </h1>
                <p className="landing-body journey-hero-intro">
                  Find the bus, the boarding point, and the changes along the
                  way. Start with where you are going.
                </p>
              </div>
              <LandingHeroForm
                variant="hero"
                onLocationsChange={(origin, destination) =>
                  setEndpoints({ origin, destination })
                }
                onNearby={() => void nearby()}
                nearbyBusy={locating}
                onSearch={(a, b) => navigate(travelUrl(a, b))}
              />
              {error && (
                <p className="journey-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <LandingJourneyMap {...endpoints} />
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
            <p className="journey-notice">{network?.notice}</p>
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
