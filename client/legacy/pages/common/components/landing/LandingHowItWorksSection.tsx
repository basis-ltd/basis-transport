import { landingSteps } from './landingContent';
import LandingSection, { LandingSectionHeader } from './LandingSection';

const LandingHowItWorksSection = () => {
  return (
    <LandingSection id="how-it-works" tone="surface">
      <LandingSectionHeader
        eyebrow="How it works"
        title="Three steps to your first confident commute"
        description="Plan your route, check what's running, and travel knowing what to expect."
      />

      <ol className="grid gap-8 md:grid-cols-3">
        {landingSteps.map((step, index) => (
          <li
            key={step.step}
            className="animate-on-scroll relative"
            style={{ animationDelay: step.animationDelay }}
          >
            {index < landingSteps.length - 1 ? (
              <span
                className="absolute top-7 left-[calc(50%+2rem)] hidden h-px w-[calc(100%-4rem)] border-t border-dashed border-[var(--landing-line)] md:block"
                aria-hidden="true"
              />
            ) : null}
            <article className="text-center">
              <figure className="mx-auto mb-5 flex size-14 items-center justify-center rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-paper)]">
                <span className="landing-label tabular-nums text-[var(--landing-ink)]">
                  {step.step}
                </span>
              </figure>
              <h3 className="landing-label mb-3 text-[var(--landing-ink)]">
                {step.title}
              </h3>
              <p className="landing-body text-[var(--landing-muted)]">
                {step.description}
              </p>
            </article>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
};

export default LandingHowItWorksSection;
