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
      className="group flex items-center gap-1.5 px-2 py-1 rounded-lg border border-primary/10 hover:border-primary/20 hover:shadow-sm transition-all duration-200 ease-in-out w-fit bg-primary/5 hover:bg-primary/10"
    >
      <figure className="relative">
        <span className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <FontAwesomeIcon
          icon={faUser}
          className="relative bg-primary/5 text-primary rounded-full p-1 text-xs transition-transform duration-200 group-hover:scale-105"
        />
      </figure>
      <section className="flex flex-col">
        <span className="font-medium text-primary text-xs leading-none">
          {user?.name}
        </span>
        {user?.email && (
          <span className="text-[10px] text-secondary/70 truncate max-w-[120px] leading-none">
            {user?.email}
          </span>
        )}
      </section>
    </Link>
  );
};
