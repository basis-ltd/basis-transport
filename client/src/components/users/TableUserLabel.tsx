import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@/types/user.type';
import { SkeletonLoader } from '../inputs/Loader';
import { Link } from 'react-router-dom';
import { faUser } from '@fortawesome/free-regular-svg-icons';

export const TableUserLabel = ({
  user,
  isLoading,
}: {
  user?: User;
  isLoading?: boolean;
}) => {
  if (isLoading)
    return (
      <span className="block w-32">
        <SkeletonLoader />
      </span>
    );

  return (
    <Link
      to={`/users/${user?.id}`}
      className="group flex items-center gap-1.5 px-4 py-1 rounded-md border border-(--line) hover:border-(--line) hover: transition-all duration-200 ease-in-out w-fit bg-(--surface) hover:bg-(--surface)"
    >
      <figure className="relative">
        <span className="absolute inset-0 bg-(--surface) rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <FontAwesomeIcon
          icon={faUser}
          className="relative rounded-(--radius-pill) bg-(--surface) p-1 text-xs text-(--ink) transition-colors duration-200 ease-(--ease-flat) group-hover:bg-(--surface-hover)"
        />
      </figure>
      <section className="flex flex-col gap-0.5">
        <span className="font-normal text-(--ink) text-xs leading-none">
          {user?.name}
        </span>
        {user?.email && (
          <span className="text-[8px] font-normal text-(--muted) truncate max-w-[120px] leading-none">
            {user?.email}
          </span>
        )}
      </section>
    </Link>
  );
};
