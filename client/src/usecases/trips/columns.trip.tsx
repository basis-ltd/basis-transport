import CustomPopover from '@/components/custom/CustomPopover';
import { TableUserLabel } from '@/components/users/TableUserLabel';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/input.constants';
import { Trip } from '@/types/trip.type';
import { faCircleInfo, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const useTripColumns = () => {
  const tripsColumns: ColumnDef<Trip>[] = useMemo(
    () => [
      {
        header: 'Reference ID',
        accessorKey: 'referenceId',
      },
      {
        header: 'Depart',
        accessorKey: 'locationFrom.name',
      },
      {
        header: 'Destination',
        accessorKey: 'locationTo.name',
      },
      {
        header: 'Status',
        accessorKey: 'status',
      },
      {
        header: 'Start Time',
        accessorKey: 'startTime',
      },
      {
        header: 'End Time',
        accessorKey: 'endTime',
      },
      {
        header: 'Created By',
        accessorKey: 'createdBy.name',
        cell: ({ row }) => <TableUserLabel user={row?.original?.createdBy} />,
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
                  to={`/trips/${row?.original?.id}`}
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
    []
  );

  return { tripsColumns };
};
