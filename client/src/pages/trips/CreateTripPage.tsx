import Select from '@/components/inputs/Select';
import { Heading } from '@/components/inputs/TextInputs';
import AppLayout from '@/containers/navigation/AppLayout';
import { Controller, useForm } from 'react-hook-form';

const CreateTripPage = () => {
  /**
   * REACT HOOK FORM
   */
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // HANDLE FORM SUBMISSION
  const onSubmit = handleSubmit((data) => {
    console.log(data);
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
                    options={[]}
                    {...field}
                    placeholder='Select departing location'
                    errorMessage={errors.locationFromId?.message}
                    required
                  />
                );
              }}
            />
          </fieldset>
        </form>
      </main>
    </AppLayout>
  );
};

export default CreateTripPage;
