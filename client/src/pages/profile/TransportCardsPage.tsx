import { Heading } from '@/components/inputs/TextInputs';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { TransportCard } from '@/types/transportCard.type';
import { useFetchTransportCards } from '@/usecases/transport-cards/transportCard.hooks';
import { useEffect } from 'react';
import Loader from '@/components/inputs/Loader';
import Button from '@/components/inputs/Button';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import CustomTooltip from '@/components/custom/CustomTooltip';

const TransportCardsPage = () => {
  /**
   * STATE VARIABLES
   */
  const { transportCardsList } = useAppSelector((state) => state.transportCard);

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();

  /**
   * TRANSPORT CARDS HOOKS
   */
  const { fetchTransportCards, transportCardsIsFetching, page, size } =
    useFetchTransportCards();

  useEffect(() => {
    fetchTransportCards({
      page,
      size,
    });
  }, [fetchTransportCards, page, size]);

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <Heading>My Transport Cards</Heading>
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
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            Back
          </Button>
        </menu>
      </main>
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
  if (isLoading) {
    return (
      <article className="w-full h-32 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-primary/10">
        <Loader size="large" className="text-primary" />
      </article>
    );
  }

  if (!transportCard) {
    return (
      <article className="w-full p-4 text-center text-secondary bg-white rounded-2xl shadow-sm border border-primary/10">
        <p>No transport card found</p>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-2xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <header className="flex justify-between items-start mb-4">
        <section>
          <h1
            className={`${
              !transportCard?.name
                ? 'text-secondary/60 invisible'
                : 'text-lg font-semibold text-primary mb-1'
            }`}
          >
            {transportCard?.name || 'Unnamed Card'}
          </h1>
          <p className="text-secondary/80 text-sm font-medium">
            Card: {transportCard?.cardNumber}
          </p>
          <time className="text-xs text-secondary/60 block mt-1">
            Date added:{' '}
            {new Date(transportCard?.createdAt).toLocaleDateString()}
          </time>
        </section>
        <nav className="flex gap-2">
          <CustomTooltip label={`Edit ${transportCard?.cardNumber}`}>
            <FontAwesomeIcon
              icon={faPenToSquare}
              className="p-2 bg-primary/10 text-primary rounded-lg transition-colors duration-200 cursor-pointer hover:bg-primary/20"
              onClick={(e) => {
                e.preventDefault();
                /* TODO: Implement edit functionality */
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
                /* TODO: Implement delete functionality */
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
            <p className="text-xs text-secondary/70">Created By</p>
            <p className="text-sm text-primary truncate">
              {transportCard?.createdBy?.name || 'Unknown'}
            </p>
          </article>
          <article className="p-3 bg-white rounded-lg shadow-sm border border-primary/10">
            <p className="text-xs text-secondary/70">Status</p>
            <p className="text-sm text-primary">Active</p>
          </article>
        </section>
      </footer>
    </article>
  );
};

export default TransportCardsPage;
