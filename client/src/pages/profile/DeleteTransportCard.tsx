import Modal from "@/components/cards/Modal";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import {
  setDeleteTransportCard,
  setSelectedTransportCard,
} from "@/states/slices/transportCardSlice";
import { useCallback } from "react";
import { useDeleteTransportCardMutation } from "@/api/queries/apiQuerySlice";
import Button from "@/components/inputs/Button";
import { UUID } from "@/types";

const DeleteTransportCard = () => {
  const dispatch = useAppDispatch();
  const { deleteTransportCard, selectedTransportCard } = useAppSelector(
    (state) => state.transportCard,
  );
  const [deleteMutation, { isLoading }] = useDeleteTransportCardMutation();

  const closeModal = useCallback(() => {
    dispatch(setDeleteTransportCard(false));
    dispatch(setSelectedTransportCard(undefined));
  }, [dispatch]);

  const handleConfirm = async () => {
    if (!selectedTransportCard?.id) {
      return;
    }
    try {
      await deleteMutation(selectedTransportCard.id as UUID).unwrap();
      closeModal();
    } catch {
      /* non-blocking */
    }
  };

  return (
    <Modal
      isOpen={deleteTransportCard}
      onClose={closeModal}
      heading={`Delete ${selectedTransportCard?.name || "card"}`}
    >
      <article className="w-full flex flex-col gap-4">
        <p className="text-sm text-(--muted) font-normal py-2">
          This will permanently remove transport card{" "}
          <span className="font-medium text-(--ink)">
            {selectedTransportCard?.cardNumber}
          </span>
          . This cannot be undone.
        </p>

        <footer className="flex items-center justify-end gap-2">
          <Button type="button" disabled={isLoading} onClick={closeModal}>
            Keep card
          </Button>
          <Button
            primary
            type="button"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleConfirm}
          >
            Delete card
          </Button>
        </footer>
      </article>
    </Modal>
  );
};

export default DeleteTransportCard;
