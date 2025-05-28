import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { Heading } from '@/components/inputs/TextInputs';
import validateInputs from '@/helpers/validations.helper';
import { useSignup } from '@/usecases/auth/auth.hooks';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

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
    <main className="w-full h-screen items-center justify-center flex flex-col gap-4">
      <form
        className="w-full py-8 max-w-[35%] sm:max-w-[90%] md:max-w-[60%] lg:max-w-[35%] shadow-md rounded-md bg-white p-8 mx-auto flex flex-col gap-4"
        onSubmit={onSubmit}
      >
        <header className="flex flex-col gap-2 items-center mb-4">
          <Heading type="h1">Create Account</Heading>
          <p className="text-sm text-secondary">
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
                required
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            rules={{
              required: `Please enter your email address`,
              validate: (value) =>
                validateInputs(value, 'email') ||
                'Please enter a valid email address',
            }}
            render={({ field }) => (
              <Input
                {...field}
                errorMessage={errors.email?.message}
                placeholder="Enter email address"
                label="Email"
                required
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
            <Button type="submit" className='w-full' isLoading={signupIsLoading} primary>
              Sign Up
            </Button>
          <p className="text-sm text-secondary">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-primary hover:underline transition-colors duration-200"
            >
              Login
            </Link>
            </p>
          </menu>
        </footer>
      </form>
    </main>
  );
};

export default Signup; 