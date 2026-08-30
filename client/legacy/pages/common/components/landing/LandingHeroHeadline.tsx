interface LandingHeroHeadlineProps {
  onLearnMore: () => void;
}

const LandingHeroHeadline = ({ onLearnMore }: LandingHeroHeadlineProps) => {
  return (
    <div className="space-y-4">
      <hgroup className="space-y-3">
        <h1 className="landing-display max-w-[14ch] text-balance text-[var(--landing-ink)]">
          Know your bus
          <br />
          before you leave.
        </h1>
        <p className="landing-body max-w-[46ch] text-[var(--landing-muted)]">
          Live schedules, seat capacity, and route guidance.
        </p>
      </hgroup>

      <button
        type="button"
        onClick={onLearnMore}
        className="landing-link-sweep block"
      >
        Learn more
      </button>
    </div>
  );
};

export default LandingHeroHeadline;
