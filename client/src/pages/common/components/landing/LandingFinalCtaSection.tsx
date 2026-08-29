import Button from '@/components/inputs/Button';
import {
  publicClasses,
  publicColors as Colors,
} from '@/containers/public/publicTheme';

interface LandingFinalCtaSectionProps {
  onLearnMore?: () => void;
}

const LandingFinalCtaSection = ({
  onLearnMore,
}: LandingFinalCtaSectionProps) => {
  return (
    <section className={publicClasses.section} style={{ backgroundColor: Colors.white }}>
      <article className={`${publicClasses.containerNarrow} text-center`}>
        <header className="animate-on-scroll">
          <h2 className={`${publicClasses.landingSectionTitle} mb-6`}>
            Done stressing about your commute?
          </h2>
          <p className={`${publicClasses.landingBody} mb-10`}>
            Create your free account and start your confident commute today.
          </p>
          <nav className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button route="/dashboard" primary>
              Create free account
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
