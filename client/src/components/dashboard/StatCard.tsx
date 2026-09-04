import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Sparkline from '@/components/charts/Sparkline';

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  sparkValues?: number[];
  sparkLabel?: string;
}

/**
 * One metric + the action it implies. Every dashboard card pairs a number
 * with somewhere to go — a stat without a next step is decoration.
 */
const StatCard = ({
  label,
  value,
  sub,
  icon,
  actionHref,
  actionLabel,
  sparkValues,
  sparkLabel,
}: StatCardProps) => (
  <article className="card-framed flex flex-col gap-3 p-5">
    <div className="flex items-center justify-between gap-3">
      <p className="type-label text-(--muted)">{label}</p>
      <span className="text-(--muted)" aria-hidden="true">
        {icon}
      </span>
    </div>
    <div className="flex items-end justify-between gap-3">
      <p className="type-page-title text-(--ink)">{value}</p>
      {sparkValues && sparkValues.length > 0 ? (
        <Sparkline
          values={sparkValues}
          ariaLabel={sparkLabel ?? `${label} trend`}
        />
      ) : null}
    </div>
    {sub ? <p className="type-body-sm text-(--muted)">{sub}</p> : null}
    {actionHref && actionLabel ? (
      <Link
        to={actionHref}
        className="type-body-sm text-(--ink) underline underline-offset-4"
      >
        {actionLabel}
      </Link>
    ) : null}
  </article>
);

export default StatCard;
