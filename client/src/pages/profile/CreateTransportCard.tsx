import Modal from "@/components/cards/Modal";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { setCreateTransportCard } from "@/states/slices/transportCardSlice";
import { useCallback } from "react";
import { useCreateTransportCardMutation } from "@/api/queries/apiQuerySlice";
import Input from "@/components/inputs/Input";
import Button from "@/components/inputs/Button";
import { Controller, useForm } from "react-hook-form";

const CreateTransportCard = () => {
  const dispatch = useAppDispatch();
  const { createTransportCard } = useAppSelector(
    (state) => state.transportCard,
  );

  // TRANSPORT CARD HOOKS
  const [createTransportCardMutation, { isLoading }] =
    useCreateTransportCardMutation();

  // REACT HOOK FORM
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const closeModal = useCallback(() => {
    dispatch(setCreateTransportCard(false));
  }, [dispatch]);

  const onSubmit = handleSubmit(async (data) => {
    await createTransportCardMutation({
      name: data.name?.trim() || undefined,
      cardNumber: data.cardNumber?.trim(),
    }).unwrap();
    closeModal();
  });

  return (
    <Modal
      isOpen={createTransportCard}
      onClose={closeModal}
      heading="Add transport card"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
        <fieldset className="w-full grid grid-cols-2 gap-4 justify-between">
          <Controller
            name="cardNumber"
            control={control}
            rules={{ required: "Card number is required" }}
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  label="Card number"
                  placeholder="Enter card number"
                  required
                  errorMessage={errors.cardNumber?.message as string}
                />
              );
            }}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Name"
                placeholder="Enter name"
                errorMessage={errors.name?.message as string}
              />
            )}
          />
        </fieldset>
        <Button
          type="submit"
          className="self-end"
          primary
          disabled={isLoading}
          isLoading={isLoading}
        >
          Create
        </Button>
      </form>
    </Modal>
  );
};

export default CreateTransportCard;
