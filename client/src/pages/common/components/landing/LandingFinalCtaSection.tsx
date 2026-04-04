import Button from '@/components/inputs/Button';
import { publicColors as Colors } from '@/containers/public/publicTheme';

interface LandingFinalCtaSectionProps {
  onLearnMore?: () => void;
}

const LandingFinalCtaSection = ({
  onLearnMore,
}: LandingFinalCtaSectionProps) => {
  return (
    <section className="py-24" style={{ backgroundColor: Colors.white }}>
      <article className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <header className="animate-on-scroll">
          <h2
            className="text-4xl lg:text-5xl leading-tight mb-6 font-light"
            style={{ color: Colors.primary }}
          >
            Done stressing about your commute?
          </h2>
          <p className="text-lg mb-10" style={{ color: Colors.neutralLight }}>
            Create your free account and start your confident commute today.
          </p>
          <nav className="flex flex-col sm:flex-row gap-4 justify-center">
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
              Learn more
            </Button>
          </nav>
        </header>
      </article>
    </section>
  );
};

export default LandingFinalCtaSection;
