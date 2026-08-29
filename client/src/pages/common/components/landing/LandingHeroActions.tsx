import { LANDING_HERO_FORM_ID } from './LandingHeroForm';

interface LandingHeroActionsProps {
  isLoading: boolean;
  onSeeNearby: () => void;
}

const LandingHeroActions = ({
  isLoading,
  onSeeNearby,
}: LandingHeroActionsProps) => {
  return (
    <nav
      className="flex w-full flex-wrap items-center justify-between gap-4 max-sm:flex-col-reverse max-sm:items-stretch"
      aria-label="Hero actions"
    >
      <button type="button" onClick={onSeeNearby} className="landing-link-sweep">
        See departures near me
      </button>

      <button
        type="submit"
        form={LANDING_HERO_FORM_ID}
        disabled={isLoading}
        className="landing-btn-primary max-sm:w-full"
      >
        {isLoading ? 'Loading…' : 'See travel options'}
      </button>
    </nav>
  );
};

export default LandingHeroActions;
