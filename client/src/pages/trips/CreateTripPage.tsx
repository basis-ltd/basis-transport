import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import { Heading } from '@/components/inputs/TextInputs';
import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';
import { useFetchLocations } from '@/usecases/locations/location.hooks';
import { useCreateTrip } from '@/usecases/trips/trip.hooks';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const CreateTripPage = () => {
  /**
   * STATE VARIABLES
   */
  const { locationsList } = useAppSelector((state) => state.location);

  /**
   * REACT HOOK FORM
   */
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  // WATCH FORM VALUES
  const { locationFromId } = watch();

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();

  /**
   * LOCATION HOOKS
   */
  const { locationsIsFetching, fetchLocations } = useFetchLocations();

  // FETCH LOCATIONS
  useEffect(() => {
    fetchLocations({
      page: 0,
      size: 100,
    });
  }, [fetchLocations]);

  /**
   * TRIP HOOKS
   */
  const {
    createTrip,
    createTripIsLoading,
    createTripIsSuccess,
    createTripReset,
  } = useCreateTrip();

  useEffect(() => {
    if (createTripIsSuccess) {
      createTripReset();
      navigate('/trips');
    }
  }, [createTripIsSuccess, createTripReset, navigate]);

  // HANDLE FORM SUBMISSION
  const onSubmit = handleSubmit((data) => {
    createTrip({
      locationFromId: data?.locationFromId,
      locationToId: data?.locationToId,
      totalCapacity: data?.totalCapacity,
    });
  });

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <ul className="w-full flex items-center gap-3 justify-between">
            <Heading>Create Trip</Heading>
          </ul>
        </nav>
        <form className="w-full flex flex-col gap-6" onSubmit={onSubmit}>
          <fieldset className="w-full grid grid-cols-2 gap-4 justify-between">
            <Controller
              name="locationFromId"
              control={control}
              rules={{ required: `Please select the departing location` }}
              render={({ field }) => {
                return (
                  <Select
                    label="Departing Location"
                    disabled={locationsIsFetching}
                    options={locationsList?.map((location) => ({
                      label: location?.name,
                      value: location.id,
                    }))}
                    {...field}
                    placeholder="Select departing location"
                    errorMessage={errors.locationFromId?.message}
                    required
                  />
                );
              }}
            />
            <Controller
              name="locationToId"
              control={control}
              rules={{ required: `Please select the arriving location` }}
              render={({ field }) => {
                let options =
                  locationsList?.map((location) => ({
                    label: location?.name,
                    value: location.id,
                  })) || [];

                if (locationFromId) {
                  options = options.filter(
                    (option) => option.value !== locationFromId
                  );
                }

                return (
                  <Select
                    label="Arriving Location"
                    disabled={locationsIsFetching}
                    options={options}
                    {...field}
                    placeholder="Select arriving location"
                    errorMessage={errors.locationToId?.message}
                    required
                  />
                );
              }}
            />
            <Controller
              name="totalCapacity"
              control={control}
              rules={{
                required: `Please enter the total capacity`,
                min: {
                  value: 10,
                  message: `Total capacity must be at least 10`,
                },
              }}
              render={({ field }) => {
                return (
                  <Input
                    label="Total Capacity"
                    {...field}
                    placeholder="Enter total capacity (optional)"
                    type="number"
                    errorMessage={errors.totalCapacity?.message}
                    required
                  />
                );
              }}
            />
          </fieldset>
          <menu className="w-full flex items-center gap-3 justify-between">
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate('/trips');
              }}
            >
              Back
            </Button>
            <Button
              primary
              submit
              className="self-end"
              isLoading={createTripIsLoading}
            >
              Save
            </Button>
          </menu>
        </form>
      </main>
    </AppLayout>
  );
};

export default CreateTripPage;
