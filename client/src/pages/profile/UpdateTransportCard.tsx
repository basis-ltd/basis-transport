import Modal from '@/components/cards/Modal';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import {
  setSelectedTransportCard,
  setUpdateTransportCard,
} from '@/states/slices/transportCardSlice';
import { useCallback, useEffect, useState } from 'react';
import { useUpdateTransportCardMutation } from '@/api/queries/apiQuerySlice';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { UUID } from '@/types';

const UpdateTransportCard = () => {
  const dispatch = useAppDispatch();
  const { updateTransportCard, selectedTransportCard } = useAppSelector(
    (state) => state.transportCard
  );
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [updateMutation, { isLoading }] = useUpdateTransportCardMutation();

  const closeModal = useCallback(() => {
    dispatch(setUpdateTransportCard(false));
    dispatch(setSelectedTransportCard(undefined));
    setName('');
    setCardNumber('');
  }, [dispatch]);

  useEffect(() => {
    if (updateTransportCard && selectedTransportCard) {
      setName(selectedTransportCard.name ?? '');
      setCardNumber(selectedTransportCard.cardNumber ?? '');
    }
  }, [updateTransportCard, selectedTransportCard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransportCard?.id || !cardNumber.trim()) {
      return;
    }
    try {
      await updateMutation({
        id: selectedTransportCard.id as UUID,
        body: {
          name: name.trim() || undefined,
          cardNumber: cardNumber.trim(),
        },
      }).unwrap();
      closeModal();
    } catch {
      /* non-blocking */
    }
  };

  return (
    <Modal
      isOpen={updateTransportCard}
      onClose={closeModal}
      heading={`Update ${selectedTransportCard?.name || 'card'}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <div>
          <label className="text-xs text-secondary block mb-1">Card number</label>
          <Input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Card number"
            required
          />
        </div>
        <div>
          <label className="text-xs text-secondary block mb-1">
            Name (optional)
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Label on card"
          />
        </div>
        <menu className="flex gap-2 justify-end pt-2">
          <Button submit type="button" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" primary disabled={isLoading} isLoading={isLoading}>
            Save
          </Button>
        </menu>
      </form>
    </Modal>
  );
};

export default UpdateTransportCard;
