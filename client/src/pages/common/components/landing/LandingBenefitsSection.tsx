import { publicColors as Colors } from '@/containers/public/publicTheme';
import { landingBenefits } from './landingContent';

const LandingBenefitsSection = () => {
  return (
    <section className="py-24" style={{ backgroundColor: Colors.bgAlt }}>
      <article className="max-w-4xl mx-auto px-6 lg:px-8">
        <header className="text-center mb-16 animate-on-scroll">
          <h2
            className="text-4xl lg:text-5xl leading-tight mb-6 font-light"
            style={{ color: Colors.primary }}
          >
            Why commuters keep using Basis
          </h2>
          <p className="text-lg" style={{ color: Colors.neutralLight }}>
            It&apos;s not about fancy features. It&apos;s about how you feel.
          </p>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {landingBenefits.map((benefit) => (
            <li
              key={benefit.title}
              className="animate-on-scroll p-8 rounded-xl"
              style={{
                backgroundColor: Colors.white,
                animationDelay: benefit.animationDelay,
              }}
            >
              <h3
                className="text-xl font-medium mb-3"
                style={{ color: Colors.primary }}
              >
                {benefit.title}
              </h3>
              <p style={{ color: Colors.neutralLight }}>{benefit.description}</p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export default LandingBenefitsSection;
