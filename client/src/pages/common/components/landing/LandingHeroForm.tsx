import { Controller, useForm } from 'react-hook-form';
import { AlertCircle, LocateFixed } from 'lucide-react';

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
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Plan your trip</legend>

        <Controller
          name="pickupLocation"
          control={control}
          rules={{ required: 'Tell us where you are starting from' }}
          render={({ field }) => (
            <label className="block">
              <span className="landing-label mb-1.5 block">
                Current location
              </span>
              <div className="landing-field-group">
                <input
                  {...field}
                  className="landing-field"
                  placeholder="Where are you now?"
                  autoComplete="street-address"
                  aria-invalid={Boolean(errors.pickupLocation)}
                />
                <button
                  type="button"
                  onClick={() =>
                    onUseCurrentLocation((value) =>
                      setValue('pickupLocation', value, {
                        shouldValidate: true,
                      })
                    )
                  }
                  disabled={isLocating}
                  title="Use my location"
                  aria-label="Use my location"
                  className="landing-field-affix"
                >
                  <LocateFixed
                    className={`size-4 ${isLocating ? 'animate-pulse' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
              {errors.pickupLocation?.message ? (
                <span
                  className="landing-meta mt-1.5 flex items-center gap-1.5 text-[var(--landing-ink)]"
                  role="alert"
                >
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  {errors.pickupLocation.message}
                </span>
              ) : null}
            </label>
          )}
        />

        <Controller
          name="dropoffLocation"
          control={control}
          rules={{ required: 'Tell us where you are headed' }}
          render={({ field }) => (
            <label className="block">
              <span className="landing-label mb-1.5 block">
                Drop-off location
              </span>
              <input
                {...field}
                className="landing-field"
                placeholder="Where are you going?"
                autoComplete="street-address"
                aria-invalid={Boolean(errors.dropoffLocation)}
              />
              {errors.dropoffLocation?.message ? (
                <span
                  className="landing-meta mt-1.5 flex items-center gap-1.5 text-[var(--landing-ink)]"
                  role="alert"
                >
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  {errors.dropoffLocation.message}
                </span>
              ) : null}
            </label>
          )}
        />
      </fieldset>
    </form>
  );
};

export default LandingHeroForm;
