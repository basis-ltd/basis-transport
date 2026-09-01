import BackButton from "@/components/inputs/BackButton";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import TelInput from "@/components/inputs/TelInput";
import { SkeletonLoader } from "@/components/inputs/Loader";
import Select from "@/components/inputs/Select";
import { Heading } from "@/components/inputs/TextInputs";
import { Gender } from "@/constants/user.constants";

import { capitalizeString } from "@/helpers/strings.helper";
import validateInputs, {
  normalizePhoneNumber,
} from "@/helpers/validations.helper";
import { validatePhoneNumber } from "@/utils/phone.util";
import { useAppSelector } from "@/states/hooks";
import { Role } from "@/types/role.type";
import { useFetchRoles } from "@/usecases/roles/role.hooks";
import { useCreateUser } from "@/usecases/users/user.hooks";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  PageBody,
  PageHeader,
  PageSection,
} from "@/components/layout/PageShell";

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
        phoneNumber: normalizePhoneNumber(data.phoneNumber) ?? data.phoneNumber,
        gender: data.gender,
      },
      roleIds: selectedRoles?.map((role) => role.id),
    });
  });

  useEffect(() => {
    if (createUserIsSuccess) {
      createUserReset();
      navigate("/users");
    }
  }, [createUserIsSuccess, createUserReset, navigate]);

  return (
    <PageBody>
      <PageHeader
        title="Create user"
        description="Add someone to Basis Transport and set their access."
      />
      <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
        <PageSection
          title="Account details"
          description="Name, contact, and the roles this person should have."
        >
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
                  validateInputs(value, "email") ||
                  "Please enter a valid email",
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
              rules={{
                required: `Please enter user's phone number`,
                validate: (value) => validatePhoneNumber(value),
              }}
              render={({ field }) => (
                <TelInput
                  {...field}
                  label="Phone Number"
                  placeholder="7XX XXX XXX"
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
            <Heading type="h3">Assign roles</Heading>
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
                    (role) => !["SUPER_ADMIN", "USER"].includes(role.name),
                  )
                  .map((role) => (
                    <label
                      key={role.id}
                      className="w-full flex items-center gap-3 p-3 rounded-(--radius-control) border border-(--line) bg-(--surface-sunken) hover:border-(--line-strong) hover:bg-(--surface) transition-[background-color,border-color,box-shadow] duration-200 cursor-pointer text-sm font-medium hover:shadow-(--shadow-card)"
                    >
                      <Input
                        type="checkbox"
                        checked={selectedRoles.some((r) => r.id === role.id)}
                        onChange={() => {
                          setSelectedRoles((prev) =>
                            prev.some((r) => r.id === role.id)
                              ? prev.filter((r) => r.id !== role.id)
                              : [...prev, role],
                          );
                        }}
                      />
                      <span className="text-(--muted) font-normal transition-all duration-200">
                        {capitalizeString(role.name)}
                      </span>
                    </label>
                  ))}
              </menu>
            )}
          </article>
          <menu className="w-full flex items-center gap-3 justify-between">
            <BackButton />
            <Button primary submit isLoading={createUserIsLoading}>
              Save
            </Button>
          </menu>
        </PageSection>
      </form>
    </PageBody>
  );
};

export default CreateUserPage;
