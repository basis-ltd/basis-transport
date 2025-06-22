import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { SkeletonLoader } from '@/components/inputs/Loader';
import Select from '@/components/inputs/Select';
import { Heading } from '@/components/inputs/TextInputs';
import { Gender } from '@/constants/user.constants';
import AppLayout from '@/containers/navigation/AppLayout';
import { capitalizeString } from '@/helpers/strings.helper';
import validateInputs from '@/helpers/validations.helper';
import { useAppSelector } from '@/states/hooks';
import { Role } from '@/types/role.type';
import { useFetchRoles } from '@/usecases/roles/role.hooks';
import { useCreateUser } from '@/usecases/users/user.hooks';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const CreateUserPage = () => {
  /**
   * STATE VARIABLES
   */
  const { rolesList } = useAppSelector((state) => state.role);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  /**
   * REACT HOOK FORM
   */
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /**
   * NAVIGATION
   */
  const navigate = useNavigate();

  /**
   * ROLE HOOKS
   */
  const { fetchRoles, rolesIsFetching } = useFetchRoles();

  /**
   * USER HOOKS
   */
  const {
    createUser,
    createUserIsLoading,
    createUserReset,
    createUserIsSuccess,
  } = useCreateUser();

  useEffect(() => {
    fetchRoles({
      page: 0,
      size: 100,
    });
  }, [fetchRoles]);

  // HANDLE FORM SUBMISSION
  const onSubmit = handleSubmit((data) => {
    createUser({
      user: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
      },
      roleIds: selectedRoles?.map((role) => role.id),
    });
  });

  useEffect(() => {
    if (createUserIsSuccess) {
      createUserReset();
      navigate('/users');
    }
  }, [createUserIsSuccess, createUserReset, navigate]);

  return (
    <AppLayout>
      <main className="w-full flex flex-col gap-4">
        <nav className="w-full flex flex-col gap-4">
          <Heading>Create User</Heading>
        </nav>
        <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
          <fieldset className="w-full grid grid-cols-2 gap-4 justify-between">
            <Controller
              name="name"
              control={control}
              rules={{ required: `Please enter user's name` }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Name"
                  placeholder="Enter user name"
                  errorMessage={errors.name?.message as string}
                  required
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{
                required: `Please enter user's email`,
                validate: (value) =>
                  validateInputs(value, 'email') ||
                  'Please enter a valid email',
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Email"
                  placeholder="Enter user email"
                  errorMessage={errors.email?.message as string}
                  required
                />
              )}
            />
            <Controller
              name="phoneNumber"
              control={control}
              rules={{ required: `Please enter user's phone number` }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Phone Number"
                  placeholder="Enter user phone number"
                  errorMessage={errors.phoneNumber?.message as string}
                  required
                />
              )}
            />
            <Controller
              name="gender"
              control={control}
              rules={{ required: `Please select user's gender` }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={Object.entries(Gender).map(([key, value]) => ({
                    label: capitalizeString(key),
                    value,
                  }))}
                  label="Gender"
                  placeholder="Select user gender"
                  errorMessage={errors.gender?.message as string}
                  required
                />
              )}
            />
          </fieldset>
          <article className="w-full flex flex-col gap-4 mt-4">
            <Heading type="h3" className="uppercase">
              Assign roles
            </Heading>
            {rolesIsFetching ? (
              <menu className="w-full grid grid-cols-4 gap-4 items-center justify-between">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonLoader key={index} className="w-full h-10" />
                ))}
              </menu>
            ) : (
              <menu className="w-full grid grid-cols-3 gap-4 justify-between">
                {rolesList
                  ?.filter(
                    (role) => !['SUPER_ADMIN', 'ADMIN'].includes(role.name)
                  )
                  .map((role) => (
                    <label
                      key={role.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-secondary border-opacity-30 bg-background hover:border-primary hover:border-opacity-50 transition-all duration-200 cursor-pointer text-[13px] hover:text-foreground"
                    >
                      <Input
                        type="checkbox"
                        checked={selectedRoles.some((r) => r.id === role.id)}
                        onChange={() => {
                          setSelectedRoles((prev) =>
                            prev.some((r) => r.id === role.id)
                              ? prev.filter((r) => r.id !== role.id)
                              : [...prev, role]
                          );
                        }}
                      />
                      <span className="text-secondary font-medium transition-all duration-200">
                        {capitalizeString(role.name)}
                      </span>
                    </label>
                  ))}
              </menu>
            )}
          </article>
          <menu className="w-full flex items-center gap-3 justify-between">
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
              }}
            >
              Back
            </Button>
            <Button primary submit isLoading={createUserIsLoading}>
              Save
            </Button>
          </menu>
        </form>
      </main>
    </AppLayout>
  );
};

export default CreateUserPage;
