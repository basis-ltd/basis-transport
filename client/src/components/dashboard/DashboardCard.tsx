import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowUp,
  faArrowDown,
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

  return (
    <article
      className="relative flex flex-col items-start cursor-pointer justify-between w-full h-full bg-white shadow-sm rounded-2xl p-5 gap-4 overflow-hidden transition-transform duration-200 ease-in-out hover:scale-[1.02] border border-primary/10"
      tabIndex={0}
      aria-label={title}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-background/40 opacity-80 pointer-events-none rounded-2xl"
      />
      <section className="flex items-start justify-between w-full gap-3 z-10">
        <menu className="flex items-start flex-col gap-2">
          <Heading isLoading={isLoading} type="h3" className="text-secondary font-medium text-[14px]">
            {title}
          </Heading>
          <header className="flex flex-wrap items-end gap-2">
            <Heading isLoading={isLoading} type="h1" className="font-semibold text-[1.8rem] text-primary">
              {Number(value).toLocaleString()}
            </Heading>
            {change !== undefined && (
              <span
                className={`flex items-center gap-1 text-[12px] font-medium ${
                  isPositive
                    ? 'text-green-600'
                    : isNegative
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                <FontAwesomeIcon icon={isPositive ? faArrowUp : faArrowDown} />
                {isPositive && '+'}
                {change}%
              </span>
            )}
          </header>
          <p className="text-xs text-secondary/70">{description}</p>
        </menu>
        <figure className="p-3 rounded-2xl flex items-center justify-center bg-primary/10 text-primary shadow-sm">
          <FontAwesomeIcon
            className="text-primary text-[22px] drop-shadow"
            icon={icon}
          />
        </figure>
      </section>
      <Link
        to={route ?? '#'}
        className="flex w-full mt-1 text-[13px] z-10 text-secondary hover:text-primary transition-colors duration-200"
      >
        <menu className="flex items-center gap-2 text-[12px] ease-in-out hover:gap-3 duration-300 hover:underline hover:underline-offset-4">
          View more
          <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
        </menu>
      </Link>
    </article>
  );
};

export default DashboardCard;
