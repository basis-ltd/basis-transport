import CustomPopover from '@/components/custom/CustomPopover';
import { TableUserLabel } from '@/components/users/TableUserLabel';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/input.constants';
import { UserTrip } from '@/types/userTrip.type';
import { faCircleInfo, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const useUserTripColumns = ({
  page,
  size,
}: {
  page?: number;
  size?: number;
}) => {
  /**
   * COLUMN DEFINITIONS
   */
  const userTripColumns: ColumnDef<UserTrip>[] = useMemo(
    () => [
      {
        header: 'No.',
        accessorKey: 'id',
        cell: ({ row }) => ((page || 1) - 1) * (size || 10) + row?.index + 1,
      },
      {
        header: 'Trip Reference',
        accessorKey: 'trip.referenceId',
      },
      {
        header: 'User',
        accessorKey: 'user.name',
        cell: ({ row }) => <TableUserLabel user={row?.original?.user} />,
      },
      {
        header: 'Status',
        accessorKey: 'status',
      },
      {
        header: 'Entance time',
        accessorKey: 'startTime',
        cell: ({ row }) => {
          if (row?.original?.startTime) {
            return (
              <p className="text-sm">
                {new Date(row?.original?.startTime).toLocaleString()}
              </p>
            );
          }
        },
      },
      {
        header: 'End Time',
        accessorKey: 'endTime',
      },
      {
        header: 'Created By',
        accessorKey: 'createdBy.name',
        cell: ({ row }) => (
          <TableUserLabel
            user={row?.original?.createdBy || row?.original?.user}
          />
        ),
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
                  to={`/user-trips/${row?.original?.id}`}
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

  return { userTripColumns };
};
