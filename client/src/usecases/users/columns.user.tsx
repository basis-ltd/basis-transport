import CustomPopover from '@/components/custom/CustomPopover';
import TableStatusLabel from '@/components/custom/TableStatusLabel';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/input.constants';
import { Gender, getGenderLabel } from '@/constants/user.constants';
import { capitalizeString } from '@/helpers/strings.helper';
import { User } from '@/types/user.type';
import { faCircleInfo, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
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
  const userColumns: ColumnDef<User>[] = useMemo(
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
        cell: ({ row }) => getGenderLabel(row?.original?.gender || Gender.MALE),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <TableStatusLabel status={row?.original?.status} />,
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
              <span className="text-[13px]">
                {capitalizeString(roles[0] as string)}
              </span>
              <CustomPopover
                trigger={
                  <span className="text-primary cursor-pointer text-[13px]">
                    (+{roles.length - 1})
                  </span>
                }
              >
                <menu className="flex flex-col w-full gap-1 p-1">
                  {roles?.map((role, index) => (
                    <li
                      key={index}
                      className="text-sm p-1 px-3 rounded-md hover:bg-background"
                    >
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
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        cell: ({ row }) => {
          return (
            <CustomPopover
              trigger={
                <FontAwesomeIcon
                  icon={faEllipsisH}
                  className={ellipsisHClassName}
                />
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
