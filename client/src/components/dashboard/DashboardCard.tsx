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
      className="relative flex flex-col items-start cursor-pointer justify-between w-full h-full bg-white/80 shadow-lg rounded-xl p-5 gap-4 overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105"
      tabIndex={0}
      aria-label={title}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-secondary/5 to-background/5 opacity-80 pointer-events-none rounded-xl"
      />
      <section className="flex items-center justify-between w-full gap-2 z-10">
        <menu className="flex items-start flex-col gap-2 max-[700px]:gap-2">
          <Heading isLoading={isLoading} type="h3" className="text-secondary font-semibold text-[15px] max-[1200px]:text-[14px] max-[700px]:text-[13px]">
            {title}
          </Heading>
          <header className="flex items-end gap-2">
            <Heading isLoading={isLoading} type="h1" className="font-bold text-[1.5rem] text-primary drop-shadow-sm">
              {Number(value).toLocaleString()}
            </Heading>
            {change !== undefined && (
              <span
                className={`flex items-center gap-1 text-[13px] font-medium ${
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
          <p className="text-xs text-secondary/80 mt-1">{description}</p>
        </menu>
        <figure className="p-3 rounded-xl flex items-center justify-center bg-primary/90 shadow-md">
          <FontAwesomeIcon
            className="text-white text-[24px] max-[500px]:text-[18px] drop-shadow"
            icon={icon}
          />
        </figure>
      </section>
      <Link
        to={route ?? '#'}
        className="flex w-full mt-2 text-[13px] z-10 text-secondary hover:text-primary transition-colors duration-300"
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
