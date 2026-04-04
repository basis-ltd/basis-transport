import Button from '@/components/inputs/Button';
import { publicColors as Colors } from '@/containers/public/publicTheme';
import { landingHeroStats } from './landingContent';
import LandingHeroBackgroundCanvas from './LandingHeroBackgroundCanvas';

interface LandingHeroSectionProps {
  onLearnMore?: () => void;
}

const LandingHeroSection = ({ onLearnMore }: LandingHeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <figure className="absolute inset-0 z-0" aria-hidden="true">
        <LandingHeroBackgroundCanvas />
      </figure>

      <aside
        className="absolute inset-0 bg-gradient-to-b from-[#fafaf8]/95 via-transparent to-[#fafaf8]/95 z-10 pointer-events-none"
        aria-hidden="true"
      />
      <aside
        className="absolute inset-0 bg-gradient-to-r from-[#fafaf8]/85 via-transparent to-[#fafaf8]/85 z-10 pointer-events-none"
        aria-hidden="true"
      />

      <article className="relative z-20 max-w-4xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <header className="animate-on-scroll">
          <h1
            className="text-5xl lg:text-6xl leading-tight mb-6 font-light text-balance"
            style={{ color: Colors.primary }}
          >
            Never wonder when your bus is coming.
          </h1>

          <p
            className="text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl"
            style={{ color: Colors.neutralLight }}
          >
            Real-time arrivals, available seats, and the confidence to leave
            home exactly on time. It&apos;s free and takes 30 seconds to set up.
          </p>

          <nav className="flex flex-col sm:flex-row gap-4">
            <Button primary route="/dashboard">
              Create Free Account
            </Button>
            <Button
              route="#how-it-works"
              onClick={(event) => {
                event.preventDefault();
                onLearnMore?.();
              }}
            >
              See how it works
            </Button>
          </nav>

          <p className="mt-8 text-sm" style={{ color: Colors.neutralLight }}>
            Free to use. No credit card needed.
          </p>
        </header>

        <aside
          className="mt-20 animate-on-scroll grid grid-cols-3 gap-8 lg:gap-12"
          style={{ animationDelay: '0.2s' }}
        >
          {landingHeroStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <data
                className="block text-3xl lg:text-4xl font-light mb-2"
                style={{ color: Colors.primary }}
              >
                {stat.value}
              </data>
              <span className="text-sm" style={{ color: Colors.neutralLight }}>
                {stat.label}
              </span>
            </div>
          ))}
        </aside>
      </article>
    </section>
  );
};

export default LandingHeroSection;
