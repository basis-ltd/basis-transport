import {
  BellRing,
  Bus,
  Clock3,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { LandingFeatureIcon, landingFeatures } from './landingContent';
import LandingSection, { LandingSectionHeader } from './LandingSection';

const featureIcons: Record<LandingFeatureIcon, LucideIcon> = {
  arrivals: Clock3,
  seats: Users,
  history: Bus,
  alerts: BellRing,
};

const LandingFeaturesSection = () => {
  return (
    <LandingSection>
      <LandingSectionHeader
        eyebrow="What you get"
        title="Simple tools that actually help"
        description="Schedules, capacity, and route guidance — the information that matters before you step outside."
      />

      <ul className="grid gap-8 md:grid-cols-2">
        {landingFeatures.map((feature) => {
          const Icon = featureIcons[feature.icon];

          return (
            <li
              key={feature.title}
              className="animate-on-scroll flex gap-4"
              style={{ animationDelay: feature.animationDelay }}
            >
              <span className="landing-icon-chip shrink-0" aria-hidden="true">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="landing-label mb-2 text-[var(--landing-ink)]">
                  {feature.title}
                </h3>
                <p className="landing-body text-[var(--landing-muted)]">
                  {feature.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
};

export default LandingFeaturesSection;
