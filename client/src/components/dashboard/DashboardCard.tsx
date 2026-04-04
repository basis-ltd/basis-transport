import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { publicColors } from '@/containers/public/publicTheme';
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

  return (
    <article
      className="relative flex flex-col items-start cursor-pointer justify-between w-full h-full shadow-lg rounded-2xl bg-white/90 border border-primary/10 p-6 gap-4 overflow-hidden transition-shadow duration-200 ease-in-out hover:shadow-xl"
      tabIndex={0}
      aria-label={title}
    >
      <section className="flex items-start justify-between w-full gap-4 z-10">
        <menu className="flex items-start flex-col gap-2 min-w-0 flex-1">
          <Heading
            isLoading={isLoading}
            type="h3"
            className="!font-normal !text-base !leading-snug text-balance !text-primary"
          >
            {title}
          </Heading>
          <header className="flex flex-wrap items-end gap-2">
            <Heading
              isLoading={isLoading}
              type="h1"
              className="!leading-tight !text-primary"
            >
              {Number(value).toLocaleString()}
            </Heading>
            {change !== undefined && (
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  isPositive
                    ? 'text-green-600'
                    : isNegative
                      ? 'text-red-600'
                      : 'text-muted-foreground'
                }`}
              >
                <FontAwesomeIcon
                  className="text-[9px] sm:text-[10px] lg:text-[11px]"
                  icon={isPositive ? faArrowUp : faArrowDown}
                />
                {isPositive && '+'}
                {change}%
              </span>
            )}
          </header>
          <p
            className="text-[11px] leading-relaxed text-balance"
            style={{ color: publicColors.neutralLight }}
          >
            {description}
          </p>
        </menu>
        <figure
          className="shrink-0 p-3 rounded-2xl flex items-center justify-center bg-primary/5 border border-primary/10 text-primary"
          style={{ color: publicColors.primary }}
        >
          <FontAwesomeIcon className="text-lg lg:text-xl" icon={icon} />
        </figure>
      </section>
      <Link
        to={route ?? '#'}
        className="flex w-full mt-1 z-10 text-primary font-light text-[11px] lg:text-[12px] leading-tight hover:underline transition-colors duration-200 ease-in-out"
      >
        <span className="inline-flex items-center gap-1.5 text-primary font-light text-[11px] lg:text-[12px] leading-tight">
          View more
          <FontAwesomeIcon icon={faArrowRight} className="text-primary text-[10px]" aria-hidden />
        </span>
      </Link>
    </article>
  );
};

export default DashboardCard;
