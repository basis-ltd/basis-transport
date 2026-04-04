import { publicColors as Colors } from '@/containers/public/publicTheme';
import { landingSteps } from './landingContent';

const LandingHowItWorksSection = () => {
  return (
    <section
      className="py-24"
      style={{ backgroundColor: Colors.bgAlt }}
      id="how-it-works"
    >
      <article className="max-w-4xl mx-auto px-6 lg:px-8">
        <header className="text-center mb-16 animate-on-scroll">
          <h2
            className="text-4xl lg:text-5xl leading-tight mb-6 font-light"
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
                  className="w-16 h-16 mx-auto mb-6 rounded-lg flex items-center justify-center font-light text-xl"
                  style={{
                    backgroundColor: Colors.primary,
                    color: Colors.white,
                  }}
                >
                  {step.step}
                </figure>
                <h3
                  className="text-xl font-medium mb-3"
                  style={{ color: Colors.primary }}
                >
                  {step.title}
                </h3>
                <p style={{ color: Colors.neutralLight }}>{step.description}</p>
              </article>
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
};

export default LandingHowItWorksSection;
