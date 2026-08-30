import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import validateInputs from '@/helpers/validations.helper';
import { useSignup } from '@/usecases/auth/auth.hooks';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo';
import {
  AuthPageShell,
} from './AuthPageShell';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { signup, signupIsLoading } = useSignup();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = handleSubmit((data) => {
    signup({
      name: data?.name,
      email: data?.email,
      password: data?.password,
      phoneNumber: data?.phoneNumber,
    });
  });

  return (
    <>
      <Seo
        title="Sign Up | Basis Transport"
        description="Create your Basis Transport account to access live bus tracking, seat availability, and public transport analytics. Join commuters and operators optimizing their journeys."
        canonicalPath="/auth/register"
        ogDescription="Create your Basis Transport account to access live bus tracking, seat availability, and public transport analytics."
      />
      <AuthPageShell>
          <form
            className="card-framed flex w-full flex-col gap-5 p-8 max-sm:p-5"
            onSubmit={onSubmit}
          >
            <header className="flex flex-col gap-2 items-center mb-4">
              <h1
                className="text-center text-balance text-(--ink)"
              >
                Create Account
              </h1>
              <p
                className="type-body-sm text-center text-(--muted)"
              >
                Please fill in the form to create your account
              </p>
            </header>
            <fieldset className="w-full flex flex-col gap-5">
              <Controller
                control={control}
                name="name"
                rules={{
                  required: `Please enter your name`,
                  validate: (value) =>
                    validateInputs(value, 'text') || 'Please enter a valid name',
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.name?.message}
                    placeholder="Enter your name"
                    label="Name"
                    autoComplete="name"
                    required
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                rules={{
                  validate: (value) =>
                    !value ||
                    validateInputs(value, 'email') ||
                    'Please enter a valid email address',
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.email?.message}
                    placeholder="Enter email address (optional)"
                    label="Email (Optional)"
                    autoComplete="email"
                  />
                )}
              />
              <Controller
                control={control}
                name="phoneNumber"
                rules={{
                  required: `Please enter your phone number`,
                  validate: (value) =>
                    validateInputs(value, 'number') ||
                    'Please enter a valid phone number',
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.phoneNumber?.message}
                    placeholder="Enter phone number"
                    label="Phone Number"
                    autoComplete="tel"
                    required
                    type="tel"
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                rules={{
                  required: `Please enter your password`,
                  validate: (value) =>
                    validateInputs(value, 'password') ||
                    'Password must be at least 8 characters, include uppercase, lowercase, number, and special character',
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.password?.message}
                    placeholder="Enter password"
                    label="Password"
                    autoComplete="new-password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    suffixIcon={showPassword ? faEyeSlash : faEye}
                    suffixIconHandler={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                  />
                )}
              />
            </fieldset>
            <footer className="w-full flex flex-col items-center gap-2 mt-2">
              <menu className="w-full flex flex-col items-center justify-between gap-2">
                <Button
                  type="submit"
                  primary
                    className="w-full"
                  isLoading={signupIsLoading}
                >
                  Sign Up
                </Button>
                <p className="type-body-sm text-(--muted)">
                  Already have an account?{' '}
                  <Link
                    to="/auth/login"
                    className="text-(--ink) hover:underline transition-colors duration-200 ease-in-out type-body-sm"
                  >
                    Login
                  </Link>
                </p>
              </menu>
            </footer>
          </form>
      </AuthPageShell>
    </>
  );
};

export default Signup;
