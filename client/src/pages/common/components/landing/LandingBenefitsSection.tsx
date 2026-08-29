import { publicClasses, publicColors as Colors } from '@/containers/public/publicTheme';
import { landingBenefits } from './landingContent';

const LandingBenefitsSection = () => {
  return (
    <section className={publicClasses.section} style={{ backgroundColor: Colors.bgAlt }}>
      <article className={publicClasses.container}>
        <header className="text-center mb-16 animate-on-scroll">
          <h2 className={`${publicClasses.landingSectionTitle} mb-6`}>
            Why commuters keep using Basis
          </h2>
          <p className={publicClasses.landingBody}>
            It&apos;s not about fancy features. It&apos;s about how you feel.
          </p>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {landingBenefits.map((benefit) => (
            <li
              key={benefit.title}
              className={`animate-on-scroll ${publicClasses.card}`}
              style={{ animationDelay: benefit.animationDelay }}
            >
              <h3 className={`${publicClasses.landingCardTitle} mb-3`}>
                {benefit.title}
              </h3>
              <p className={publicClasses.landingBody}>
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export default LandingBenefitsSection;
