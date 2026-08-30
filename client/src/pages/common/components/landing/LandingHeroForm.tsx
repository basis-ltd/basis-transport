import { useState, type FormEventHandler } from 'react';
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import {
  faLocationCrosshairs,
  faPen,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PlaceSearch from '@/components/inputs/PlaceSearch';
import Modal from '@/components/cards/Modal';
import Button from '@/components/inputs/Button';
import { FieldMessage } from '@/components/inputs/Field';
import { fieldErrorClassName } from '@/components/inputs/control';
import type { GeolocationPickupState } from '@/hooks/locations/useGeolocationPickup';
import type {
  LandingHeroFormValues,
  TripLocation,
} from '@/types/tripLocation.type';
import {
  describeLocation,
  hasCoordinates,
  placeSearchResultToTripLocation,
} from '@/utils/locations.util';

export const LANDING_HERO_FORM_ID = 'landing-hero-form';

export type { LandingHeroFormValues } from '@/types/tripLocation.type';

interface LandingHeroFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
  control: Control<LandingHeroFormValues>;
  errors: FieldErrors<LandingHeroFormValues>;
  geolocation: GeolocationPickupState;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <span className={`mt-1.5 ${fieldErrorClassName}`} role="alert">
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="mt-[0.15em] size-3.5 shrink-0"
        aria-hidden="true"
      />
      {message}
    </span>
  ) : null;

interface LocationFieldProps {
  name: 'pickupLocation' | 'dropoffLocation';
  control: Control<LandingHeroFormValues>;
  label: string;
  placeholder: string;
  requiredMessage: string;
  errorMessage?: string;
  validate?: (value: TripLocation | undefined) => true | string;
  geolocation?: GeolocationPickupState;
}

const LocationField = ({
  name,
  control,
  label,
  placeholder,
  requiredMessage,
  errorMessage,
  validate,
  geolocation,
}: LocationFieldProps) => {
  const [searchText, setSearchText] = useState('');
  const [confirmGeoOpen, setConfirmGeoOpen] = useState(false);
  const {
    pickupSource,
    setPickupSource,
    locationError,
    isLocating,
    useMyLocation: requestMyLocation,
    clearLocationError,
  } = geolocation ?? {};

  const handleUseMyLocation = async () => {
    setConfirmGeoOpen(false);
    await requestMyLocation?.(name);
  };

  const isPickupField = name === 'pickupLocation';
  const useCurrentLocationLabel = isPickupField
    ? 'Set your device location as pickup'
    : 'Set your device location as drop-off';

  const renderSelectedLocation = (location: TripLocation) => {
    if (
      isPickupField &&
      pickupSource === 'geolocation' &&
      !location.name?.trim() &&
      !location.formattedAddress?.trim()
    ) {
      return 'Your location';
    }

    if (
      !isPickupField &&
      !location.name?.trim() &&
      !location.formattedAddress?.trim()
    ) {
      return 'Your location';
    }

    return describeLocation(location);
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: requiredMessage,
        validate: (value) => {
          if (!hasCoordinates(value)) {
            return 'Select a location from the suggestions';
          }
          if (validate) {
            return validate(value);
          }
          return true;
        },
      }}
      render={({ field }) => (
        <div>
          <label className="type-label mb-1.5 block" htmlFor={`hero-${name}`}>
            {label}
          </label>

          {field.value ? (
            <div className="flex h-10 items-center gap-3 rounded-(--radius-control) border border-(--line) bg-(--paper) pl-3.5 pr-1.5">
              <span className="min-w-0 flex-1 truncate text-sm text-(--ink)">
                {renderSelectedLocation(field.value)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchText(describeLocation(field.value));
                  field.onChange(undefined);
                }}
                className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) outline-none transition-[background-color,box-shadow] duration-200 ease-(--ease-flat) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
                aria-label={`Change ${label.toLowerCase()}`}
              >
                <FontAwesomeIcon icon={faPen} className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <PlaceSearch
                value={searchText}
                onChange={setSearchText}
                onLocationSelect={(result) => {
                  setSearchText(result.formattedAddress || result.name);
                  clearLocationError?.();
                  if (name === 'pickupLocation') {
                    setPickupSource?.('search');
                  }
                  field.onChange(placeSearchResultToTripLocation(result));
                }}
                placeholder={placeholder}
                country="rw"
                className={geolocation ? '[&_input]:pr-10' : undefined}
                emptyOption={
                  geolocation
                    ? {
                        label: isLocating
                          ? 'Finding your location…'
                          : 'Use current location',
                        description: useCurrentLocationLabel,
                        icon: (
                          <FontAwesomeIcon
                            icon={faLocationCrosshairs}
                            className={`size-4 ${isLocating ? 'animate-pulse' : ''}`}
                          />
                        ),
                        disabled: isLocating,
                        onSelect: handleUseMyLocation,
                      }
                    : undefined
                }
              />
              {geolocation ? (
                <button
                  type="button"
                  onClick={() => setConfirmGeoOpen(true)}
                  disabled={isLocating}
                  className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-(--radius-control) text-(--muted) outline-none transition-[background-color,color,box-shadow] duration-200 ease-(--ease-flat) hover:bg-(--surface) hover:text-(--ink) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Use my location"
                >
                  <FontAwesomeIcon
                    icon={faLocationCrosshairs}
                    className={`size-4 ${isLocating ? 'animate-pulse' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              ) : null}
            </div>
          )}

          {geolocation ? (
            <FieldMessage errorMessage={locationError ?? undefined} />
          ) : null}
          <FieldError message={errorMessage} />

          {geolocation ? (
            <Modal
              isOpen={confirmGeoOpen}
              onClose={() => setConfirmGeoOpen(false)}
              heading={
                isPickupField
                  ? 'Use your current location for pickup?'
                  : 'Use your current location for drop-off?'
              }
            >
              <p className="type-meta mb-4 text-(--muted)">
                {isPickupField
                  ? 'Basis will read your device location once to fill in where you are starting from. It is not saved or shared.'
                  : 'Basis will read your device location once to fill in where you are headed. It is not saved or shared.'}
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setConfirmGeoOpen(false)}
                >
                  Type an address
                </Button>
                <Button
                  type="button"
                  primary
                  onClick={() => void handleUseMyLocation()}
                  isLoading={isLocating}
                >
                  Use my location
                </Button>
              </div>
            </Modal>
          ) : null}
        </div>
      )}
    />
  );
};

const LandingHeroForm = ({
  onSubmit,
  control,
  errors,
  geolocation,
}: LandingHeroFormProps) => {
  const pickupLocation = useWatch({ control, name: 'pickupLocation' });

  const validateDistinctLocation = (
    value: TripLocation | undefined
  ): true | string => {
    if (!value || !pickupLocation) return true;
    const same = pickupLocation.placeId
      ? pickupLocation.placeId === value.placeId
      : pickupLocation.latitude === value.latitude &&
        pickupLocation.longitude === value.longitude;
    return same ? 'Pickup and drop-off must be different places' : true;
  };

  return (
    <form id={LANDING_HERO_FORM_ID} onSubmit={onSubmit} className="w-full">
      <fieldset className="grid items-start gap-4 sm:grid-cols-2">
        <legend className="sr-only">Plan your trip</legend>

        <LocationField
          name="pickupLocation"
          control={control}
          label="Current location"
          placeholder="Where are you now?"
          requiredMessage="Tell us where you are starting from"
          errorMessage={errors.pickupLocation?.message}
          geolocation={geolocation}
        />
        <LocationField
          name="dropoffLocation"
          control={control}
          label="Drop-off location"
          placeholder="Where are you going?"
          requiredMessage="Tell us where you are headed"
          errorMessage={errors.dropoffLocation?.message}
          validate={validateDistinctLocation}
          geolocation={geolocation}
        />
      </fieldset>
    </form>
  );
};

export default LandingHeroForm;
