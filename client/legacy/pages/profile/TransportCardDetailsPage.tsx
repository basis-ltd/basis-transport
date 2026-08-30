import AppLayout from "@/containers/navigation/AppLayout";
import DeleteTransportCard from "./DeleteTransportCard";
import UpdateTransportCard from "./UpdateTransportCard";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { UUID } from "@/types";
import BackButton from "@/components/inputs/BackButton";
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
import { useFetchTransportCardById } from "@/usecases/transport-cards/transportCard.hooks";
import { useFetchAuditLogsByEntityId } from "@/usecases/audit-logs/auditLog.hooks";
import { AuditLogDiffList } from "@/components/audit";
import { KeyValuePair } from "@/components/inputs/KeyValuePair";
import CustomPopover from "@/components/custom/CustomPopover";
import {
  ellipsisHClassName,
  tableActionClassName,
  tableDangerActionClassName,
} from "@/constants/input.constants";
import {
  PageBody,
  PageFooter,
  PageHeader,
  PageSection,
} from "@/components/layout/PageShell";

const TransportCardDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

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
      <PageBody>
        <PageHeader
          title="Card details"
          description={
            transportCard?.cardNumber
              ? `Transport card ${transportCard.cardNumber}`
              : 'Transport card'
          }
          actions={
            <CustomPopover
              trigger={
                <button
                  type="button"
                  aria-label="Card actions"
                  className={ellipsisHClassName}
                >
                  <FontAwesomeIcon icon={faEllipsisH} />
                </button>
              }
            >
              <menu className="flex w-full flex-col gap-1">
                <Link
                  to={`/account/transport-cards/${id}/edit`}
                  className={tableActionClassName}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setSelectedTransportCard(transportCard));
                    dispatch(setUpdateTransportCard(true));
                  }}
                >
                  <FontAwesomeIcon icon={faPenToSquare} aria-hidden="true" />
                  Edit card
                </Link>
                <Link
                  to={`/account/transport-cards/${id}/delete`}
                  className={tableDangerActionClassName}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setSelectedTransportCard(transportCard));
                    dispatch(setDeleteTransportCard(true));
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
                  Delete card
                </Link>
              </menu>
            </CustomPopover>
          }
        />

        <PageSection title="Card information">
          <ul className="grid gap-5 sm:grid-cols-2">
            {Object.entries(transportCard ?? {}).map(([key, value]) => (
              <KeyValuePair key={key} keyText={key} valueText={value} />
            ))}
          </ul>
        </PageSection>

        <PageSection
          title="Audit history"
          description="Every change made to this card."
          actions={
            <Button
              type="button"
              size="sm"
              icon={auditOpen ? faChevronUp : faChevronDown}
              onClick={() => setAuditOpen((open) => !open)}
            >
              {auditOpen ? 'Hide' : 'Show'}
            </Button>
          }
        >
          {auditOpen ? (
            <AuditLogDiffList
              logs={auditLogsData?.data?.rows ?? []}
              isLoading={auditLogsIsFetching}
              emptyMessage="No update history with diffs yet."
            />
          ) : (
            <p className="type-meta">
              History is hidden. Show it to review past changes.
            </p>
          )}
        </PageSection>

        <PageFooter>
          <BackButton />
        </PageFooter>
      </PageBody>
      <DeleteTransportCard />
      <UpdateTransportCard />
    </AppLayout>
  );
};

export default TransportCardDetailsPage;
