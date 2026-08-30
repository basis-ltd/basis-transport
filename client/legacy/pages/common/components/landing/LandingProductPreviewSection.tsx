import LandingSection, { LandingSectionHeader } from './LandingSection';

const LandingProductPreviewSection = () => {
  return (
    <LandingSection>
      <LandingSectionHeader
        eyebrow="Inside the app"
        title="Designed to be simple"
        description="No confusing menus. No unnecessary steps. Just the information you need before you board."
      />

      <figure className="animate-on-scroll overflow-hidden rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-surface)]">
        <div className="p-6 sm:p-8">
          <header className="mb-6">
            <p className="landing-eyebrow mb-4">Your next bus</p>
            <article className="rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-paper)] p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="landing-meta">Route 47 → Downtown</p>
                  <p className="landing-display mt-1 text-[1.5rem] text-[var(--landing-ink)]">
                    Arrives in 7 min
                  </p>
                </div>
                <span className="landing-meta rounded-full border border-[var(--landing-line)] px-3 py-1">
                  On time
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="landing-meta mb-1">Available seats</p>
                  <p className="landing-label text-[var(--landing-ink)]">12 left</p>
                </div>
                <div>
                  <p className="landing-meta mb-1">Next buses</p>
                  <p className="landing-body text-[var(--landing-muted)]">+15, +28 min</p>
                </div>
              </div>
            </article>
          </header>

          <section>
            <p className="landing-eyebrow mb-4">Your stops</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                { name: 'Home (Downtown)', routes: '4 routes' },
                { name: 'Work (Central Station)', routes: '3 routes' },
              ].map((stop) => (
                <li
                  key={stop.name}
                  className="landing-card cursor-default p-4 hover:shadow-none"
                >
                  <p className="landing-label text-[var(--landing-ink)]">{stop.name}</p>
                  <p className="landing-meta mt-1">{stop.routes}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </figure>

      <footer className="animate-on-scroll mt-10 text-center">
        <p className="landing-body text-[var(--landing-muted)]">
          That&apos;s it. No clutter. No distractions. Just the bus information
          that matters to you.
        </p>
      </footer>
    </LandingSection>
  );
};

export default LandingProductPreviewSection;
