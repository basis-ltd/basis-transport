import { Heading } from "@/components/inputs/TextInputs";
import AppLayout from "@/containers/navigation/AppLayout";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { useFetchTransportCards } from "@/usecases/transport-cards/transportCard.hooks";
import Button from "@/components/inputs/Button";
import { useNavigate } from "react-router-dom";
import DeleteTransportCard from "./DeleteTransportCard";
import UpdateTransportCard from "./UpdateTransportCard";
import CreateTransportCard from "./CreateTransportCard";
import {
  setCreateTransportCard,
} from "@/states/slices/transportCardSlice";
import Table from "@/components/table/Table";
import { useTransportCardColumns } from "@/usecases/transport-cards/columns.transportCard";
import { useEffect } from "react";

const TransportCardsPage = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { transportCardsList } = useAppSelector((state) => state.transportCard);

  // NAVIGATION
  const navigate = useNavigate();

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
      fetchTransportCards({ page, size, createdById: user?.id });
    }
  }, [user, fetchTransportCards, page, size, user?.id]);

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
