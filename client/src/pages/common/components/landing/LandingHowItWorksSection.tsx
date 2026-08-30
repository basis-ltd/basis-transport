import { publicClasses, publicColors as Colors } from '@/containers/public/publicTheme';
import { landingSteps } from './landingContent';

const LandingHowItWorksSection = () => {
  return (
    <section
      className={publicClasses.section}
      style={{ backgroundColor: Colors.bgAlt }}
      id="how-it-works"
    >
      <article className={publicClasses.container}>
        <header className="text-center mb-16 animate-on-scroll">
          <h2
            className={`${publicClasses.landingSectionTitle} mb-6`}
            style={{ color: Colors.primary }}
          >
            Three steps to your first confident commute
          </h2>
        </header>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {landingSteps.map((step) => (
            <li
              key={step.step}
              className="animate-on-scroll"
              style={{ animationDelay: step.animationDelay }}
            >
              <article className="text-center">
                <figure
                  className="w-16 h-16 mx-auto mb-6 rounded-md flex items-center justify-center font-normal text-[13px]"
                  style={{
                    backgroundColor: Colors.primary,
                    color: Colors.white,
                  }}
                >
                  {step.step}
                </figure>
                <h3
                  className={`${publicClasses.cardTitle} mb-3`}
                  style={{ color: Colors.primary }}
                >
                  {step.title}
                </h3>
                <p
                  className={publicClasses.bodyMuted}
                  style={{ color: Colors.neutralLight }}
                >
                  {step.description}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
};

export default LandingHowItWorksSection;
