import { Controller, useForm } from 'react-hook-form';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/inputs/Input';

export const LANDING_HERO_FORM_ID = 'landing-hero-form';

export interface LandingHeroFormValues {
  pickupLocation: string;
  dropoffLocation: string;
}

interface LandingHeroFormProps {
  onSubmit: (values: LandingHeroFormValues) => void | Promise<void>;
  onUseCurrentLocation: (setPickup: (value: string) => void) => void;
  isLocating: boolean;
}

/**
 * The hero fields are the app's `Input`, not a hero-only treatment. They used
 * to be raw `landing-field` markup with a hand-built affix button and a
 * hand-built error row — a second input system on the one page a visitor is
 * most likely to compare against the sign-in form.
 */
const LandingHeroForm = ({
  onSubmit,
  onUseCurrentLocation,
  isLocating,
}: LandingHeroFormProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LandingHeroFormValues>({
    defaultValues: {
      pickupLocation: '',
      dropoffLocation: '',
    },
  });

  return (
    <form
      id={LANDING_HERO_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full"
    >
      <fieldset className="grid items-start gap-4 sm:grid-cols-2">
        <legend className="sr-only">Plan your trip</legend>

        <Controller
          name="pickupLocation"
          control={control}
          rules={{ required: 'Tell us where you are starting from' }}
          render={({ field }) => (
            <Input
              {...field}
              label="Current location"
              placeholder="Where are you now?"
              autoComplete="street-address"
              errorMessage={errors.pickupLocation?.message}
              suffixIcon={faLocationCrosshairs}
              suffixIconHandler={(event) => {
                event.preventDefault();
                onUseCurrentLocation((value) =>
                  setValue('pickupLocation', value, { shouldValidate: true })
                );
              }}
              disabled={isLocating}
            />
          )}
        />

        <Controller
          name="dropoffLocation"
          control={control}
          rules={{ required: 'Tell us where you are headed' }}
          render={({ field }) => (
            <Input
              {...field}
              label="Drop-off location"
              placeholder="Where are you going?"
              autoComplete="street-address"
              errorMessage={errors.dropoffLocation?.message}
            />
          )}
        />
      </fieldset>
    </form>
  );
};

export default LandingHeroForm;
