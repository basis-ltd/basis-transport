import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import TextArea from '@/components/inputs/TextArea';
import { Heading } from '@/components/inputs/TextInputs';
import MapView from '@/components/maps/MapView';
import AppLayout from '@/containers/navigation/AppLayout';
import { useCreateLocation } from '@/usecases/locations/location.hooks';
import { MapMouseEvent } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const CreateLocationPage = () => {
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const {
    createLocation,
    createLocationIsLoading,
    createLocationIsSuccess,
    createLocationReset,
  } = useCreateLocation();

  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      setSelectedPosition({ lat, lng });
      setValue('latitude', lat);
      setValue('longitude', lng);
    }
  };

  useEffect(() => {
    if (createLocationIsSuccess) {
      createLocationReset();
      navigate('/locations');
    }
  }, [createLocationIsSuccess, createLocationReset, navigate]);

  const onSubmit = handleSubmit((data) => {
    createLocation({
      name: data?.name,
      description: data?.description,
      address: {
        type: 'Point',
        coordinates: [data.latitude, data.longitude],
      },
    });
  });

  return (
    <AppLayout>
      <main className="flex w-full flex-col gap-4">
        <nav className="flex w-full items-center justify-between gap-4">
          <Heading>Create Location</Heading>
        </nav>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Location name is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label="Location Name"
                placeholder="Enter location name"
                errorMessage={errors.name?.message as string}
                required
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                label="Description"
                placeholder="Enter location description"
                errorMessage={errors.description?.message as string}
              />
            )}
          />

          {errors.latitude && (
            <p className="text-red-500">{errors.latitude.message as string}</p>
          )}

          <section className="flex w-full flex-col gap-2 mt-2">
            <h2 className="text-lg font-semibold">
              Select location on the map:
            </h2>
            <article className="w-full h-[50vh]">
              <MapView
                height="50vh"
                onMapClick={handleMapClick}
                selectedPosition={selectedPosition}
              />
            </article>
          </section>

          <menu className="flex w-full items-center justify-between gap-3">
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
            >
              Back
            </Button>
            <Button
              primary
              submit
              className="self-end"
              isLoading={createLocationIsLoading}
            >
              Save Location
            </Button>
          </menu>
        </form>
      </main>
    </AppLayout>
  );
};

export default CreateLocationPage;