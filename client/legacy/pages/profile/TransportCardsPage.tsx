import AppLayout from "@/containers/navigation/AppLayout";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { useFetchTransportCards } from "@/usecases/transport-cards/transportCard.hooks";
import BackButton from "@/components/inputs/BackButton";
import Button from "@/components/inputs/Button";
import { useSearchParams } from "react-router-dom";
import DeleteTransportCard from "./DeleteTransportCard";
import UpdateTransportCard from "./UpdateTransportCard";
import CreateTransportCard from "./CreateTransportCard";
import {
  setCreateTransportCard,
} from "@/states/slices/transportCardSlice";
import Table from "@/components/table/Table";
import { useTransportCardColumns } from "@/usecases/transport-cards/columns.transportCard";
import { useEffect } from "react";
import { TransportCardProvider } from "@/constants/transportCard.constants";
import { PageBody, PageHeader } from "@/components/layout/PageShell";

const TransportCardsPage = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { transportCardsList } = useAppSelector((state) => state.transportCard);

  const [searchParams] = useSearchParams();
  const providerQuery = searchParams.get("provider");
  const provider =
    providerQuery &&
    Object.values(TransportCardProvider).includes(
      providerQuery as TransportCardProvider,
    )
      ? (providerQuery as TransportCardProvider)
      : undefined;

  const { transportCardColumns } = useTransportCardColumns();

  const {
    fetchTransportCards,
    isFetching: transportCardsIsFetching,
    page,
    size,
    totalCount,
    totalPages,
    setPage,
    setSize,
  } = useFetchTransportCards();

  useEffect(() => {
    if (user) {
      fetchTransportCards({ page, size, createdById: user?.id, provider });
    }
  }, [user, fetchTransportCards, page, size, user?.id, provider]);

  return (
    <AppLayout>
      <PageBody>
        <PageHeader
          title="My transport cards"
          description="Cards you use to pay for travel."
          actions={
            <Button
              primary
              type="button"
              onClick={(e) => {
                e.preventDefault();
                dispatch(setCreateTransportCard(true));
              }}
            >
              Add card
            </Button>
          }
        />
        <Table
          data={transportCardsList}
          columns={transportCardColumns}
          isLoading={transportCardsIsFetching}
          page={page}
          size={size}
          totalCount={totalCount}
          totalPages={totalPages}
          setPage={setPage}
          setSize={setSize}
        />
        <menu className="w-full flex items-center gap-3 justify-between">
          <BackButton />
        </menu>
      </PageBody>
      <CreateTransportCard />
      <DeleteTransportCard />
      <UpdateTransportCard />
    </AppLayout>
  );
};

export default TransportCardsPage;
