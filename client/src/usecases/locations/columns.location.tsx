import CustomPopover from '@/components/custom/CustomPopover';
import { Button as UiButton } from '@/components/ui/button';
import { TableUserLabel } from '@/components/users/TableUserLabel';
import {
  ellipsisHClassName,
  tableActionClassName,
} from '@/constants/input.constants';
import { Location } from '@/types/location.type';
import { faCircleInfo, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const useLocationColumns = ({
  page,
  size,
}: {
  page?: number;
  size?: number;
}) => {
  /**
   * COLUMN DEFINITIONS
   */
  const locationColumns: ColumnDef<Location>[] = useMemo(
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
        header: 'Description',
        accessorKey: 'description',
      },
      {
        header: 'Address',
        accessorKey: 'address',
        cell: ({ row }) => {
          const coordinates = row?.original?.address?.coordinates;
          if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
            return <span className="text-gray-500">No coordinates</span>;
          }
          
          const [lat, lng] = coordinates;
          const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          
          return (
            <UiButton
              variant={`outline`}
              className="cursor-pointer hover:bg-background hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                window.open(googleMapsUrl, '_blank');
              }}
            >
              {`${lat}, ${lng}`}
            </UiButton>
          );
        },
      },
      {
        header: 'Created By',
        accessorKey: 'createdBy',
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
                  to={`/locations/${row?.original?.id}`}
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

  return { locationColumns };
};
