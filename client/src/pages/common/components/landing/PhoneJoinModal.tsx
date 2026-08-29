import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { publicClasses } from '@/containers/public/publicTheme';
import { UUID } from '@/types';
import { useQuickJoinTrip } from '@/usecases/trips/trip.hooks';
import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js';
import { Controller, useForm } from 'react-hook-form';

interface PhoneJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: UUID;
  entranceLocation: { type: 'Point'; coordinates: [number, number] };
}

const PhoneJoinModal = ({
  open,
  onOpenChange,
  tripId,
  entranceLocation,
}: PhoneJoinModalProps) => {
  const { quickJoinTrip, quickJoinTripIsLoading } = useQuickJoinTrip();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ phoneNumber: string }>({
    defaultValues: {
      phoneNumber: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await quickJoinTrip({
      tripId,
      phoneNumber: data.phoneNumber,
      entranceLocation,
    });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!quickJoinTripIsLoading} className="rounded-md shadow-sm">
        <DialogHeader>
          <DialogTitle className={publicClasses.pageTitle}>Join this trip</DialogTitle>
          <DialogDescription className={publicClasses.bodyMuted}>
            Enter your phone number to continue instantly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              required: 'Phone number is required',
              validate: (value) =>
                isValidPhoneNumber(value, 'RW') || 'Enter a valid phone number',
            }}
            render={({ field }) => (
              <Input
                {...field}
                label="Phone number"
                placeholder="+250 781 234 567"
                onChange={(event) => {
                  const formattedValue = new AsYouType('RW').input(event.target.value);
                  field.onChange(formattedValue);
                }}
                errorMessage={errors.phoneNumber?.message}
              />
            )}
          />

          <p className={publicClasses.bodyMuted}>
            This is a test entrance. Actual entrance will be recorded via
            integration with external service providers.
          </p>

          <Button
            type="submit"
            submit
            isLoading={quickJoinTripIsLoading}
            primary
          >
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneJoinModal;
