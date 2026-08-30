import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowRight,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { SkeletonLoader } from '../inputs/Loader';

interface DashboardCardProps {
  title: string;
  value: string | number;
  /**
   * Period-over-period change, as a percentage. Omit it when there is nothing
   * to compare against — the card used to be handed a hardcoded `0` and render
   * "0% · Compared to last month" under every metric, which stated a
   * comparison the API never made.
   */
  change?: number;
  icon: IconProp;
  route?: string;
  description?: string;
  isLoading?: boolean;
}

const DashboardCard = ({
  title,
  value,
  change,
  icon,
  route,
  description,
  isLoading = false,
}: DashboardCardProps) => {
  const hasChange = typeof change === 'number' && Number.isFinite(change);
  const isPositive = hasChange && change > 0;
  const isNegative = hasChange && change < 0;

  return (
    <article
      className="card-framed flex h-full flex-col justify-between gap-5 p-5 transition-colors duration-200 ease-(--ease-flat) hover:border-(--ink)"
      aria-label={title}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="type-meta truncate" title={title}>
            {title}
          </p>
          {isLoading ? (
            <SkeletonLoader type="text" width="5rem" height="1.75rem" />
          ) : (
            <p className="type-metric text-(--ink)">
              {Number(value).toLocaleString()}
            </p>
          )}
        </div>
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) bg-(--surface) text-(--ink)"
        >
          <FontAwesomeIcon icon={icon} className="size-4" />
        </span>
      </header>

      <footer className="flex flex-wrap items-center justify-between gap-2">
        {hasChange ? (
          <p
            className={`type-meta flex items-center gap-1.5 ${
              isPositive
                ? 'text-(--approve)'
                : isNegative
                  ? 'text-(--danger)'
                  : ''
            }`}
          >
            <FontAwesomeIcon
              icon={isPositive ? faArrowUp : isNegative ? faArrowDown : faArrowRight}
              className="size-3"
              aria-hidden="true"
            />
            {isPositive ? '+' : ''}
            {change}%{description ? ` · ${description}` : ''}
          </p>
        ) : description ? (
          <p className="type-meta">{description}</p>
        ) : (
          <span />
        )}

        {route ? (
          <Link
            to={route}
            className="link-sweep text-sm font-medium text-(--ink)"
          >
            View
          </Link>
        ) : null}
      </footer>
    </article>
  );
};

export default DashboardCard;
