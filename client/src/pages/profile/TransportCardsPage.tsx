import { Heading } from "@/components/inputs/TextInputs";
import AppLayout from "@/containers/navigation/AppLayout";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { TransportCard } from "@/types/transportCard.type";
import { useFetchTransportCards } from "@/usecases/transport-cards/transportCard.hooks";
import { useEffect } from "react";
import Loader from "@/components/inputs/Loader";
import Button from "@/components/inputs/Button";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomTooltip from "@/components/custom/CustomTooltip";
import DeleteTransportCard from "./DeleteTransportCard";
import UpdateTransportCard from "./UpdateTransportCard";
import CreateTransportCard from "./CreateTransportCard";
import {
  setSelectedTransportCard,
  setDeleteTransportCard,
  setUpdateTransportCard,
  setCreateTransportCard,
} from "@/states/slices/transportCardSlice";

const TransportCardsPage = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { transportCardsList } = useAppSelector((state) => state.transportCard);

  // NAVIGATION
  const navigate = useNavigate();

  const {
    fetchTransportCards,
    isFetching: transportCardsIsFetching,
    page,
    size,
  } = useFetchTransportCards();

  useEffect(() => {
    fetchTransportCards({ page, size });
  }, [page, size, fetchTransportCards]);

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-wrap items-center gap-4 justify-between">
          <Heading>My Transport Cards</Heading>
          <Button
            primary
            submit
            type="button"
            onClick={() => dispatch(setCreateTransportCard(true))}
          >
            Add card
          </Button>
        </nav>
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {transportCardsList?.map((transportCard) => (
            <TransportCardDetails
              key={transportCard.id}
              transportCard={transportCard}
              isLoading={transportCardsIsFetching}
            />
          ))}
        </section>
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

export const TransportCardDetails = ({
  transportCard,
  isLoading,
}: {
  transportCard?: TransportCard;
  isLoading?: boolean;
}) => {
  const dispatch = useAppDispatch();

  if (isLoading) {
    return (
      <article className="w-full h-32 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-primary/10">
        <Loader size="large" className="text-primary" />
      </article>
    );
  }

  if (!transportCard) {
    return (
      <article className="w-full p-4 text-center text-secondary font-light bg-white rounded-2xl shadow-sm border border-primary/10">
        <p>No transport card found</p>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-2xl border border-primary/10 shadow-sm hover:shadow-sm transition-shadow duration-200 p-5">
      <header className="flex justify-between items-start mb-4">
        <section>
          <Link
            to={`/account/transport-cards/${transportCard.id}`}
            className="block hover:opacity-80 transition-opacity"
          >
            <h1
              className={`${
                !transportCard?.name
                  ? "text-secondary/60 invisible"
                  : "text-lg font-medium text-primary mb-1"
              }`}
            >
              {transportCard?.name || "Unnamed Card"}
            </h1>
            <p className="text-secondary/80 text-sm font-light">
              Card: {transportCard?.cardNumber}
            </p>
            <time className="text-xs font-light text-secondary/60 block mt-1">
              Date added:{" "}
              {new Date(transportCard?.createdAt).toLocaleDateString()}
            </time>
          </Link>
        </section>
        <nav className="flex gap-2">
          <CustomTooltip label={`Edit ${transportCard?.cardNumber}`}>
            <FontAwesomeIcon
              icon={faPenToSquare}
              className="p-2 bg-primary/10 text-primary rounded-lg transition-colors duration-200 cursor-pointer hover:bg-primary/20"
              onClick={(e) => {
                e.preventDefault();
                dispatch(setSelectedTransportCard(transportCard));
                dispatch(setUpdateTransportCard(true));
              }}
              title="Edit card"
              aria-label="Edit transport card"
            />
          </CustomTooltip>
          <CustomTooltip
            label={`Delete ${transportCard?.cardNumber}`}
            labelClassName="bg-red-700"
          >
            <FontAwesomeIcon
              icon={faTrash}
              className="p-2 bg-red-100 text-red-700 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-red-200"
              onClick={(e) => {
                e.preventDefault();
                dispatch(setSelectedTransportCard(transportCard));
                dispatch(setDeleteTransportCard(true));
              }}
              title="Delete card"
              aria-label="Delete transport card"
            />
          </CustomTooltip>
        </nav>
      </header>

      <footer className="p-4 bg-background-secondary/70 rounded-xl">
        <h2 className="text-sm font-medium text-primary mb-2">Card Details</h2>
        <section className="grid grid-cols-2 gap-2">
          <article className="p-3 bg-white rounded-lg shadow-sm border border-primary/10">
            <p className="text-xs font-light text-secondary/70">Created By</p>
            <p className="text-sm font-medium text-primary truncate">
              {transportCard?.createdBy?.name || "Unknown"}
            </p>
          </article>
          <article className="p-3 bg-white rounded-lg shadow-sm border border-primary/10">
            <p className="text-xs font-light text-secondary/70">Status</p>
            <p className="text-sm font-medium text-primary">Active</p>
          </article>
        </section>
        <div className="mt-3">
          <Button route={`/account/transport-cards/${transportCard.id}`}>
            View details
          </Button>
        </div>
      </footer>
    </article>
  );
};

export default TransportCardsPage;
