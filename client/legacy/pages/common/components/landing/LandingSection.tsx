import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface LandingSectionProps {
  id?: string;
  children: ReactNode;
  tone?: 'paper' | 'surface';
  className?: string;
  containerClassName?: string;
}

const LandingSection = ({
  id,
  children,
  tone = 'paper',
  className,
  containerClassName,
}: LandingSectionProps) => (
  <section
    id={id}
    className={cn(
      'landing-section',
      tone === 'surface' && 'landing-section-surface',
      className,
    )}
  >
    <div className={cn('landing-container', containerClassName)}>{children}</div>
  </section>
);

interface LandingSectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const LandingSectionHeader = ({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: LandingSectionHeaderProps) => (
  <header
    className={cn(
      'landing-section-header animate-on-scroll',
      align === 'center' && 'mx-auto max-w-2xl text-center',
      className,
    )}
  >
    {eyebrow ? <p className="landing-eyebrow mb-3">{eyebrow}</p> : null}
    <h2 className="landing-display text-balance text-[var(--landing-ink)]">{title}</h2>
    {description ? (
      <p className="landing-body mt-4 text-[var(--landing-muted)]">{description}</p>
    ) : null}
    <div className="landing-route-divider mt-8" aria-hidden="true" />
  </header>
);

export default LandingSection;
