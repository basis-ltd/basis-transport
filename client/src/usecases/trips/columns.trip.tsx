import CustomPopover from '@/components/custom/CustomPopover';
import { TableUserLabel } from '@/components/users/TableUserLabel';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/input.constants';
import { TripStatus } from '@/constants/trip.constants';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { Trip } from '@/types/trip.type';
import {
  faCircleInfo,
  faEllipsisH,
  faPlay,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TripAvailableCapacity } from '@/components/trips/TripAvailableCapacity';
import moment from 'moment';
import TableStatusLabel from '@/components/custom/TableStatusLabel';
import { ReferenceIdInput } from '@/components/table/TableInputs';
import { setSelectedTrip, setStartTripModal } from '@/states/slices/tripSlice';

const TRIP_OPERATOR_ROLES = ['DRIVER', 'ADMIN', 'SUPER_ADMIN'];

export const useTripColumns = () => {

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const canOperateTrips = user?.userRoles?.some((role) =>
    TRIP_OPERATOR_ROLES.includes(role.role?.name ?? '')
  );

  const tripsColumns: ColumnDef<Trip>[] = useMemo(
    () => [
      {
        header: 'Reference ID',
        accessorKey: 'referenceId',
        cell: ({ row }) => <ReferenceIdInput label={row?.original?.referenceId} />,
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
                {canOperateTrips && (
                  <Link
                    to={`/user-trips?tripId=${row?.original?.id}`}
                    className={tableActionClassName}
                  >
                    <FontAwesomeIcon icon={faUsers} />
                    Passengers
                  </Link>
                )}
                {canOperateTrips &&
                  row.original.status === TripStatus.PENDING && (
                    <Link
                      to="#"
                      className={tableActionClassName}
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(setSelectedTrip(row.original));
                        dispatch(setStartTripModal(true));
                      }}
                    >
                      <FontAwesomeIcon icon={faPlay} />
                      Start trip
                    </Link>
                  )}
              </menu>
            </CustomPopover>
          );
        },
      },
    ],
    [canOperateTrips, dispatch]
  );

  return { tripsColumns };
};
