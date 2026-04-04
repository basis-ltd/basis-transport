import Modal from "@/components/cards/Modal";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import {
  setSelectedTransportCard,
  setUpdateTransportCard,
} from "@/states/slices/transportCardSlice";
import { useCallback, useEffect } from "react";
import { useUpdateTransportCardMutation } from "@/api/queries/apiQuerySlice";
import Input from "@/components/inputs/Input";
import Button from "@/components/inputs/Button";
import { UUID } from "@/types";
import { Controller, useForm } from "react-hook-form";

const UpdateTransportCard = () => {
  // STATE
  const dispatch = useAppDispatch();
  const { updateTransportCard, selectedTransportCard } = useAppSelector(
    (state) => state.transportCard,
  );

  // TRANSPORT CARD HOOKS
  const [updateMutation, { isLoading }] = useUpdateTransportCardMutation();

  // REACT HOOK FORM
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const closeModal = useCallback(() => {
    dispatch(setUpdateTransportCard(false));
    dispatch(setSelectedTransportCard(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (updateTransportCard && selectedTransportCard) {
      setValue("name", selectedTransportCard.name ?? "");
      setValue("cardNumber", selectedTransportCard.cardNumber ?? "");
    }
  }, [updateTransportCard, selectedTransportCard, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    await updateMutation({
      id: selectedTransportCard?.id as UUID,
      body: data,
    }).unwrap();
    closeModal();
  });

  return (
    <Modal
      isOpen={updateTransportCard}
      onClose={closeModal}
      heading={`Update ${selectedTransportCard?.name || "card"}`}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
        <fieldset className="flex flex-col gap-2">
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
            render={({ field }) => {
              return (
                <Input
                  {...field}
                  label="Name"
                  placeholder="Enter name"
                  required
                  errorMessage={errors.name?.message as string}
                />
              );
            }}
          />
        </fieldset>
        <Button
          type="submit"
          className="self-end"
          primary
          disabled={isLoading}
          isLoading={isLoading}
        >
          Save
        </Button>
      </form>
    </Modal>
  );
};

export default UpdateTransportCard;
