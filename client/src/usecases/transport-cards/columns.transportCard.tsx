import CustomPopover from "@/components/custom/CustomPopover";
import { ReferenceIdInput } from "@/components/table/TableInputs";
import {
  ellipsisHClassName,
  tableActionClassName,
} from "@/constants/input.constants";
import { capitalizeString, formatDate } from "@/helpers/strings.helper";
import { useAppDispatch } from "@/states/hooks";
import {
  setDeleteTransportCard,
  setSelectedTransportCard,
  setUpdateTransportCard,
} from "@/states/slices/transportCardSlice";
import { TransportCard } from "@/types/transportCard.type";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faCircleInfo,
  faEllipsisH,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Link } from "react-router-dom";

export const useTransportCardColumns = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  const transportCardColumns: ColumnDef<TransportCard>[] = useMemo(
    () => [
      {
        header: "Card Number",
        accessorKey: "cardNumber",
        cell: ({ row }) => <ReferenceIdInput label={row?.original?.cardNumber} />,
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Provider",
        accessorKey: "provider",
        cell: ({ row }) => capitalizeString(row?.original?.provider) || "-",
      },
      {
        header: `Date added`,
        accessorKey: "createdAt",
        cell: ({ row }) =>
          formatDate(row?.original?.createdAt, "DD/MM/YYYY HH:mm:ss"),
      },
      {
        header: `Last updated`,
        accessorKey: "updatedAt",
        cell: ({ row }) =>
          formatDate(row?.original?.updatedAt, "DD/MM/YYYY HH:mm:ss"),
      },
      {
        header: "Actions",
        accessorKey: "actions",
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
                  to={`/account/transport-cards/${row?.original?.id}`}
                  className={tableActionClassName}
                >
                  <FontAwesomeIcon icon={faCircleInfo} />
                  View details
                </Link>
                <Link
                  to={`/account/transport-cards/${row?.original?.id}/edit`}
                  className={tableActionClassName}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setSelectedTransportCard(row?.original));
                    dispatch(setUpdateTransportCard(true));
                  }}
                >
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    className="text-primary"
                  />
                  Update
                </Link>
                <Link
                  to={`/account/transport-cards/${row?.original?.id}/delete`}
                  className={tableActionClassName}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setSelectedTransportCard(row?.original));
                    dispatch(setDeleteTransportCard(true));
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} className="text-red-700" />
                  Delete
                </Link>
              </menu>
            </CustomPopover>
          );
        },
      },
    ],
    [dispatch],
  );

  return {
    transportCardColumns,
  };
};
