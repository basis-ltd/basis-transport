import { landingBenefits } from './landingContent';
import LandingSection, { LandingSectionHeader } from './LandingSection';

const LandingBenefitsSection = () => {
  return (
    <LandingSection tone="surface">
      <LandingSectionHeader
        eyebrow="Why commuters stay"
        title="Less guessing. More going."
        description="It's not about fancy features. It's about how you feel on the way to work, school, and everywhere in between."
      />

      <ul className="grid gap-5 md:grid-cols-2">
        {landingBenefits.map((benefit) => (
          <li
            key={benefit.title}
            className="landing-card animate-on-scroll"
            style={{ animationDelay: benefit.animationDelay }}
          >
            <h3 className="landing-label mb-3 text-[var(--landing-ink)]">
              {benefit.title}
            </h3>
            <p className="landing-body text-[var(--landing-muted)]">
              {benefit.description}
            </p>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
};

export default LandingBenefitsSection;
