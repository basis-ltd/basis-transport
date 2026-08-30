import { Link } from 'react-router-dom';
import LandingSection from './LandingSection';

interface LandingFinalCtaSectionProps {
  onLearnMore?: () => void;
}

const LandingFinalCtaSection = ({ onLearnMore }: LandingFinalCtaSectionProps) => {
  return (
    <LandingSection className="landing-cta-band">
      <div className="mx-auto max-w-2xl text-center animate-on-scroll">
        <h2 className="landing-display text-balance">
          Done stressing about your commute?
        </h2>
        <p className="landing-body mt-4">
          Create your free account and start travelling with schedules, seat
          availability, and route guidance you can trust.
        </p>
        <nav className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/auth/register" className="landing-btn-primary w-full sm:w-auto">
            Create free account
          </Link>
          <button
            type="button"
            onClick={onLearnMore}
            className="inline-flex h-11 w-full items-center justify-center rounded-[var(--landing-radius)] border border-[color-mix(in_oklab,var(--landing-paper)_35%,transparent)] px-5 text-sm font-medium text-[var(--landing-paper)] transition-colors hover:bg-[color-mix(in_oklab,var(--landing-paper)_10%,transparent)] sm:w-auto"
          >
            Learn more
          </button>
        </nav>
      </div>
    </LandingSection>
  );
};

export default LandingFinalCtaSection;
