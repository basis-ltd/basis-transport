import { Heading } from "@/components/inputs/TextInputs";
import AppLayout from "@/containers/navigation/AppLayout";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { useFetchTransportCards } from "@/usecases/transport-cards/transportCard.hooks";
import Button from "@/components/inputs/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
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

const TransportCardsPage = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { transportCardsList } = useAppSelector((state) => state.transportCard);

  // NAVIGATION
  const navigate = useNavigate();
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
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-wrap items-center gap-4 justify-between">
          <Heading>My Transport Cards</Heading>
          <Button
            primary
            submit
            type="button"
            onClick={(e) => {
              e.preventDefault();
              dispatch(setCreateTransportCard(true));
            }}
          >
            Add card
          </Button>
        </nav>
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
        </menu>
      </main>
      <CreateTransportCard />
      <DeleteTransportCard />
      <UpdateTransportCard />
    </AppLayout>
  );
};

export default TransportCardsPage;
