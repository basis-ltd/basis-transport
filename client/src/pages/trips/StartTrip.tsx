import Modal from "@/components/cards/Modal";
import Button from "@/components/inputs/Button";
import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { setSelectedTrip, setStartTripModal } from "@/states/slices/tripSlice";
import { useStartTrip } from "@/usecases/trips/trip.hooks";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StartTrip = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();
  const { selectedTrip, startTripModal } = useAppSelector(
    (state) => state.trip,
  );

  // NAVIGATION
  const navigate = useNavigate();

  // START TRIP
  const { startTrip, isLoading, reset, isSuccess } = useStartTrip();

  // CLOSE MODAL
  const closeModal = useCallback(() => {
    dispatch(setStartTripModal(false));
    dispatch(setSelectedTrip(undefined));
    reset();
  }, [dispatch, reset]);

  useEffect(() => {
    if (isSuccess) {
      if (selectedTrip?.id) {
        navigate(`/trips/${selectedTrip?.id}`);
      } else {
        navigate("/trips");
      }
      closeModal();
    }
  }, [isSuccess, navigate, closeModal, selectedTrip?.id]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <Modal
      isOpen={startTripModal}
      onClose={closeModal}
      heading={`Start ${selectedTrip?.referenceId}`}
    >
      <article className="w-full flex flex-col gap-4">
        <p>Are you sure you want to start this trip?</p>
        <Button
          primary
          className="self-end"
          onClick={(e) => {
            e.preventDefault();
            if (selectedTrip?.id) {
              startTrip(selectedTrip?.id);
            }
          }}
          isLoading={isLoading}
        >
          Confirm
        </Button>
      </article>
    </Modal>
  );
};

export default StartTrip;
