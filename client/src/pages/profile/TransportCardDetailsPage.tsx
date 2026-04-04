import AppLayout from "@/containers/navigation/AppLayout";
import DeleteTransportCard from "./DeleteTransportCard";
import UpdateTransportCard from "./UpdateTransportCard";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { UUID } from "@/types";
import Button from "@/components/inputs/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import {
  setSelectedTransportCard,
  setDeleteTransportCard,
  setUpdateTransportCard,
} from "@/states/slices/transportCardSlice";
import { AuditLogEntityType } from "@/types/auditLog.entity";
import { Heading } from "@/components/inputs/TextInputs";
import { useFetchTransportCardById } from "@/usecases/transport-cards/transportCard.hooks";
import { useFetchAuditLogsByEntityId } from "@/usecases/audit-logs/auditLog.hooks";
import { AuditLogDiffList } from "@/components/audit";
import { KeyValuePair } from "@/components/inputs/KeyValuePair";
import CustomPopover from "@/components/custom/CustomPopover";
import {
  ellipsisHClassName,
  tableActionClassName,
} from "@/constants/input.constants";

const TransportCardDetailsPage = () => {
  // NAVIGATION
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { transportCard } = useAppSelector((state) => state.transportCard);
  const [auditOpen, setAuditOpen] = useState(false);

  // TRANSPORT CARD HOOKS
  const { fetchTransportCardById } = useFetchTransportCardById();

  // AUDIT LOGS HOOKS
  const {
    fetchAuditLogsByEntityId,
    isFetching: auditLogsIsFetching,
    data: auditLogsData,
    reset: resetAuditLogs,
  } = useFetchAuditLogsByEntityId();

  useEffect(() => {
    if (id && auditOpen) {
      fetchAuditLogsByEntityId({
        entityType: AuditLogEntityType.TRANSPORT_CARD,
        entityId: id as UUID,
      });
    }
  }, [id, fetchAuditLogsByEntityId, auditOpen]);

  useEffect(() => {
    if (id) {
      fetchTransportCardById(id as UUID);
    }
  }, [id, fetchTransportCardById]);

  useEffect(() => {
    if (!auditOpen) {
      resetAuditLogs();
    }
  }, [auditOpen, resetAuditLogs]);

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4 mx-auto">
        <nav className="w-full flex items-center gap-4 justify-end">
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
                to={`/account/transport-cards/${id}/edit`}
                className={tableActionClassName}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setSelectedTransportCard(transportCard));
                  dispatch(setUpdateTransportCard(true));
                }}
              >
                <FontAwesomeIcon
                  icon={faPenToSquare}
                  className="text-primary text-[11px]"
                />
                Edit card
              </Link>
              <Link
                to={`/account/transport-cards/${id}/delete`}
                className={tableActionClassName}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setSelectedTransportCard(transportCard));
                  dispatch(setDeleteTransportCard(true));
                }}
              >
                <FontAwesomeIcon
                  icon={faTrash}
                  className="text-red-700 text-[11px]"
                />
                Delete card
              </Link>
            </menu>
          </CustomPopover>
        </nav>
        <section className="w-full flex flex-col gap-4">
          <ul className="w-full grid grid-cols-2 gap-4">
            {Object.entries(transportCard ?? {}).map(([key, value]) => {
              return <KeyValuePair key={key} keyText={key} valueText={value} />;
            })}
          </ul>
        </section>
        <footer className="w-full flex items-center gap-4 justify-between">
          <Button
            submit
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </Button>
          <Button
            type="button"
            icon={auditOpen ? faChevronUp : faChevronDown}
            styled={false}
            onClick={() => setAuditOpen((open) => !open)}
          >
            View audit history
          </Button>
        </footer>
        {auditOpen ? (
          <article className="w-full flex flex-col gap-4">
            <Heading type="h3">Audit history</Heading>
            <AuditLogDiffList
              logs={auditLogsData?.data?.rows ?? []}
              isLoading={auditLogsIsFetching}
              emptyMessage="No update history with diffs yet."
            />
          </article>
        ) : null}
      </main>
      <DeleteTransportCard />
      <UpdateTransportCard />
    </AppLayout>
  );
};

export default TransportCardDetailsPage;
