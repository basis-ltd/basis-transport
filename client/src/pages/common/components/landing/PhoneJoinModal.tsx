import Button from '@/components/inputs/Button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
      <DialogContent showCloseButton={!quickJoinTripIsLoading}>
        <DialogHeader>
          <DialogTitle>Join this trip</DialogTitle>
          <DialogDescription>
            Enter your phone number to continue instantly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
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
                placeholder="+250 781 234 567"
                onChange={(event) => {
                  const formattedValue = new AsYouType('RW').input(event.target.value);
                  field.onChange(formattedValue);
                }}
                aria-invalid={Boolean(errors.phoneNumber)}
              />
            )}
          />

          {errors.phoneNumber?.message && (
            <p className="text-[12px] text-red-600">{errors.phoneNumber.message}</p>
          )}

          <p className="text-[12px] font-light text-neutral-500">
            This is a test entrance. Actual entrance will be recorded via
            integration with external service providers.
          </p>

          <Button type="submit" submit primary isLoading={quickJoinTripIsLoading}>
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneJoinModal;
