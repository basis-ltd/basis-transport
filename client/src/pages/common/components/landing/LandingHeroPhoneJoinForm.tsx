import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { publicClasses } from '@/containers/public/publicTheme';
import { UUID } from '@/types';
import { useQuickJoinTrip } from '@/usecases/trips/trip.hooks';
import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js';
import { Controller, useForm } from 'react-hook-form';

interface LandingHeroPhoneJoinFormProps {
  tripId: UUID;
  tripLabel: string;
  entranceLocation: { type: 'Point'; coordinates: [number, number] };
  onCancel?: () => void;
}

const LandingHeroPhoneJoinForm = ({
  tripId,
  tripLabel,
  entranceLocation,
  onCancel,
}: LandingHeroPhoneJoinFormProps) => {
  const { quickJoinTrip, quickJoinTripIsLoading } = useQuickJoinTrip();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ phoneNumber: string }>({
    defaultValues: { phoneNumber: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    await quickJoinTrip({
      tripId,
      phoneNumber: data.phoneNumber,
      entranceLocation,
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-md bg-[#f3f3f1] p-4 shadow-sm"
    >
      <header>
        <p className={publicClasses.landingCardTitle}>Join {tripLabel}</p>
        <p className={`${publicClasses.landingMeta} mt-1`}>
          Enter your phone number to continue instantly.
        </p>
      </header>

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

      <footer className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          submit
          isLoading={quickJoinTripIsLoading}
          primary
          className="w-full sm:flex-1"
        >
          Join trip
        </Button>
        {onCancel ? (
          <Button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onCancel();
            }}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        ) : null}
      </footer>
    </form>
  );
};

export default LandingHeroPhoneJoinForm;
