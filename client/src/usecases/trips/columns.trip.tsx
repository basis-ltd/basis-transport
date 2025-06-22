import CustomPopover from '@/components/custom/CustomPopover';
import { TableUserLabel } from '@/components/users/TableUserLabel';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/input.constants';
import { Trip } from '@/types/trip.type';
import {
  faCircleInfo,
  faEllipsisH,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TripAvailableCapacity } from '@/components/trips/TripAvailableCapacity';
import moment from 'moment';
import TableStatusLabel from '@/components/custom/TableStatusLabel';

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
        cell: ({ row }) => <TableStatusLabel status={row?.original?.status} />,
      },
      {
        header: 'Start Time',
        accessorKey: 'startTime',
        cell: ({ row }) => {
          if (!row?.original?.startTime) return null;
          return (
            <p className="text-[12px]">
              {moment(row?.original?.startTime).format('HH:mm')} (
              {moment(row?.original?.startTime).format('DD/MM/YYYY')})
            </p>
          );
        },
      },
      {
        header: 'End Time',
        accessorKey: 'endTime',
        cell: ({ row }) => {
          if (!row?.original?.endTime) return null;
          return (
            <p className="text-[12px]">
              {moment(row?.original?.endTime).format('HH:mm')} (
              {moment(row?.original?.endTime).format('DD/MM/YYYY')})
            </p>
          );
        },
      },
      {
        header: 'Available Seats',
        accessorKey: 'availableCapacity',
        cell: ({ row }) => <TripAvailableCapacity tripId={row.original.id} />,
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
                <Link
                  to={`/user-trips?tripId=${row?.original?.id}`}
                  className={tableActionClassName}
                >
                  <FontAwesomeIcon icon={faUsers} />
                  Passengers
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
