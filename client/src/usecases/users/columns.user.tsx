import CustomPopover from '@/components/custom/CustomPopover';
import StatusBadge from '@/components/inputs/StatusBadge';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/input.constants';
import { Gender, getGenderLabel } from '@/constants/user.constants';
import { capitalizeString } from '@/helpers/strings.helper';
import { User } from '@/types/user.type';
import { faCircleInfo, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { AppColumnDef } from '@/components/table/tableFeatures';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const useUserColumns = ({
  page,
  size,
}: {
  page?: number;
  size?: number;
}) => {
  /**
   * COLUMN DEFINITIONS
   */
  const userColumns: AppColumnDef<User>[] = useMemo(
    () => [
      {
        header: 'No.',
        accessorKey: 'id',
        cell: ({ row }) => ((page || 1) - 1) * (size || 10) + row?.index + 1,
      },
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Phone',
        accessorKey: 'phoneNumber',
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
        cell: ({ row }) => capitalizeString(getGenderLabel(row?.original?.gender || Gender.MALE)),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row?.original?.status} />,
      },
      {
        header: 'Roles',
        accessorKey: 'userRoles',
        id: 'roles',
        cell: ({ row }) => {
          const roles = row?.original?.userRoles?.map((role) => role.role?.name) || [];
          if (roles.length === 1) {
            return capitalizeString(roles[0] as string);
          }
          return (
            <span className="flex items-center gap-2">
              <span className="text-sm">
                {capitalizeString(roles[0] as string)}
              </span>
              <CustomPopover
                trigger={
                  <button
                    type="button"
                    className="cursor-pointer text-sm text-(--ink) underline underline-offset-4"
                    aria-label={`Show all ${roles.length} roles`}
                  >
                    (+{roles.length - 1})
                  </button>
                }
              >
                <menu className="flex flex-col w-full gap-1 p-1">
                  {roles?.map((role, index) => (
                    <li key={index} className={tableActionClassName}>
                      {capitalizeString(role as string)}
                    </li>
                  ))}
                </menu>
              </CustomPopover>
            </span>
          );
        },
      },
      {
        header: 'Nationality',
        accessorKey: 'nationality',
        cell: ({ row }) => capitalizeString(row?.original?.nationality || 'N/A'),
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        cell: ({ row }) => {
          return (
            <CustomPopover
              trigger={
                <button
                  type="button"
                  className={ellipsisHClassName}
                  aria-label="Row actions"
                >
                  <FontAwesomeIcon icon={faEllipsisH} aria-hidden="true" />
                </button>
              }
            >
              <menu className="w-full flex flex-col gap-1">
                <Link
                  to={`/users/${row?.original?.id}`}
                  className={tableActionClassName}
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                  View details
                </Link>
              </menu>
            </CustomPopover>
          );
        },
      },
    ],
    [page, size]
  );

  return { userColumns };
};
