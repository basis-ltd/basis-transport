import { publicColors as Colors } from '@/containers/public/publicTheme';
import { LandingFeatureIcon, landingFeatures } from './landingContent';

const renderFeatureIcon = (icon: LandingFeatureIcon) => {
  switch (icon) {
    case 'arrivals':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={Colors.white}
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="1" />
          <path d="M12 1v6m0 6v6" />
          <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24" />
          <path d="M1 12h6m6 0h6" />
          <path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
        </svg>
      );
    case 'seats':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={Colors.white}
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'history':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={Colors.white}
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );
    case 'alerts':
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={Colors.white}
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M18 9l-6 6-6-6" />
          <path d="M18 5l-6 6-6-6" />
        </svg>
      );
  }
};

const LandingFeaturesSection = () => {
  return (
    <section className="py-24" style={{ backgroundColor: Colors.white }}>
      <article className="max-w-4xl mx-auto px-6 lg:px-8">
        <header className="text-center mb-16 animate-on-scroll">
          <h2
            className="text-4xl lg:text-5xl leading-tight mb-6 font-light"
            style={{ color: Colors.primary }}
          >
            Simple tools that actually help
          </h2>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {landingFeatures.map((feature) => (
            <li
              key={feature.title}
              className="animate-on-scroll"
              style={{ animationDelay: feature.animationDelay }}
            >
              <div className="flex gap-5 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: Colors.primary }}
                >
                  {renderFeatureIcon(feature.icon)}
                </div>
                <div>
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: Colors.primary }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: Colors.neutralLight }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export default LandingFeaturesSection;
