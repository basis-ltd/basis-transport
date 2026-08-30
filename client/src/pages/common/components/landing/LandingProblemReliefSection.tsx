import LandingSection from './LandingSection';

const LandingProblemReliefSection = () => {
  return (
    <LandingSection>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-12">
        <article className="animate-on-scroll">
          <p className="landing-eyebrow mb-3">Before you leave</p>
          <h2 className="landing-label mb-4 text-[var(--landing-ink)]">
            The stress of not knowing
          </h2>
          <div className="space-y-4 landing-body text-[var(--landing-muted)]">
            <p>
              You check the time. You check the street. Is your bus here? Did you
              miss it? Will you be late? Every commute is a guess, and guessing
              makes you anxious.
            </p>
            <p>
              You wonder if there&apos;s a seat. You stress about being packed in.
              You don&apos;t know if you should wait or walk to the next stop.
            </p>
          </div>
        </article>

        <div
          className="hidden lg:flex flex-col items-center gap-3 self-stretch py-2"
          aria-hidden="true"
        >
          <span className="size-2 rounded-full border border-[var(--landing-ink)] bg-[var(--landing-paper)]" />
          <span className="w-px flex-1 border-l border-dashed border-[var(--landing-line)]" />
          <span className="size-2 rounded-full border border-[var(--landing-ink)] bg-[var(--landing-paper)]" />
        </div>

        <article className="animate-on-scroll" style={{ animationDelay: '0.12s' }}>
          <p className="landing-eyebrow mb-3">With Basis Transport</p>
          <h2 className="landing-label mb-4 text-[var(--landing-ink)]">
            The calm of knowing
          </h2>
          <div className="space-y-4 landing-body text-[var(--landing-muted)]">
            <p>
              Open Basis. See your bus coming in 7 minutes. You know exactly when
              to leave. No stress. No surprises.
            </p>
            <p>
              Check how many seats are open. Travel when you&apos;re ready. That
              15 minutes you save every day? That&apos;s time for coffee, or just
              breathing.
            </p>
          </div>
        </article>
      </div>
    </LandingSection>
  );
};

export default LandingProblemReliefSection;
