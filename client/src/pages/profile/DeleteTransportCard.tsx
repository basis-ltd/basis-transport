import Modal from '@/components/cards/Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setDeleteTransportCard,
  setSelectedTransportCard,
} from '@/states/slices/transportCardSlice';
import { useCallback } from 'react';
import { useDeleteTransportCardMutation } from '@/api/queries/apiQuerySlice';
import Button from '@/components/inputs/Button';
import { UUID } from '@/types';

const DeleteTransportCard = () => {
  const dispatch = useAppDispatch();
  const { deleteTransportCard, selectedTransportCard } = useAppSelector(
    (state) => state.transportCard
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
      heading={`Delete ${selectedTransportCard?.name || 'card'}`}
    >
      <p className="text-sm text-secondary font-light py-2">
        This will permanently remove transport card{' '}
        <span className="font-medium text-primary">
          {selectedTransportCard?.cardNumber}
        </span>
        . This cannot be undone.
      </p>
      <menu className="flex gap-2 justify-end pt-4">
        <Button submit type="button" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          submit
          type="button"
          danger
          disabled={isLoading}
          isLoading={isLoading}
          onClick={handleConfirm}
        >
          Delete
        </Button>
      </menu>
    </Modal>
  );
};

export default DeleteTransportCard;
