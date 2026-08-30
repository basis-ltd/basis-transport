import { landingTestimonials } from './landingContent';
import LandingSection, { LandingSectionHeader } from './LandingSection';

const LandingTestimonialsSection = () => {
  return (
    <LandingSection tone="surface">
      <LandingSectionHeader
        eyebrow="Commuters"
        title="Real people. Real time saved."
      />

      <ul className="grid gap-6 md:grid-cols-2">
        {landingTestimonials.map((testimonial) => (
          <li
            key={testimonial.author}
            className="landing-card animate-on-scroll border-l-4 border-l-[var(--landing-ink)]"
            style={{ animationDelay: testimonial.animationDelay }}
          >
            <blockquote>
              <p className="landing-body text-[var(--landing-ink)]">
                {testimonial.quote}
              </p>
              <footer className="mt-5">
                <cite className="landing-meta not-italic text-[var(--landing-muted)]">
                  {testimonial.author} · {testimonial.role}
                </cite>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
};

export default LandingTestimonialsSection;
