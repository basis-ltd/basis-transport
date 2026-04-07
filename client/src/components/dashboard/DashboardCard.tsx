import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Heading } from '../inputs/TextInputs';

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string | number;
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
  description = 'Compared to last month',
  isLoading = false,
}: DashboardCardProps) => {
  // STATE VARIABLES
  const isPositive = Number(change) > 0;
  const isNegative = Number(change) < 0;
  const hasChange = change !== undefined && Number.isFinite(Number(change));

  return (
    <article
      className="surface-card relative flex h-full w-full cursor-pointer flex-col justify-between gap-4 overflow-hidden p-5 transition-all duration-200 ease-in-out hover:scale-[1.02]"
      tabIndex={0}
      aria-label={title}
    >
      <section className="surface-tint pointer-events-none absolute inset-0" />
      <section className="relative z-10 flex w-full items-start justify-between gap-3">
        <header className="flex min-w-0 flex-1 flex-col gap-2">
          <Heading
            isLoading={isLoading}
            type="h3"
            className="!text-[12px] !font-medium !leading-tight !text-secondary"
          >
            {title}
          </Heading>
          <section className="flex flex-wrap items-end gap-2">
            <Heading
              isLoading={isLoading}
              type="h1"
              className="!text-[13px] !font-semibold !leading-tight !text-primary"
            >
              {Number(value).toLocaleString()}
            </Heading>
            {hasChange && (
              <p
                className={`flex items-center gap-1 text-[12px] font-light ${
                  isPositive
                    ? 'text-green-600'
                    : isNegative
                      ? 'text-red-600'
                      : 'text-muted-foreground'
                }`}
              >
                <FontAwesomeIcon
                  className="text-[9px] sm:text-[10px] md:text-[10px] lg:text-[11px]"
                  icon={isPositive ? faArrowUp : isNegative ? faArrowDown : faArrowRight}
                />
                {isPositive && '+'}
                {change}%
              </p>
            )}
          </section>
          <p className="text-[12px] font-light leading-relaxed text-secondary">
            {description}
          </p>
        </header>
        <figure
          className="flex shrink-0 items-center justify-center rounded-md bg-primary/10 p-3 text-primary shadow-sm"
        >
          <FontAwesomeIcon className="text-[12px] md:text-[13px]" icon={icon} />
        </figure>
      </section>
      <Link
        to={route ?? '#'}
        className="relative z-10 mt-1 flex w-fit items-center gap-1.5 text-[12px] font-light leading-tight text-primary transition-colors duration-200 ease-in-out hover:underline"
      >
        View details
        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" aria-hidden />
      </Link>
    </article>
  );
};

export default DashboardCard;
