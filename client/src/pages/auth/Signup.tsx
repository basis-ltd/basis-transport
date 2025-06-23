import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { Heading } from '@/components/inputs/TextInputs';
import validateInputs from '@/helpers/validations.helper';
import { useSignup } from '@/usecases/auth/auth.hooks';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

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
      <Helmet>
        <title>Sign Up | Basis Transport</title>
        <meta name="description" content="Create your Basis Transport account to access live bus tracking, seat availability, and public transport analytics. Join commuters and operators optimizing their journeys." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Basis Transport Team" />
        <meta property="og:title" content="Sign Up | Basis Transport" />
        <meta property="og:description" content="Create your Basis Transport account to access live bus tracking, seat availability, and public transport analytics." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://transport.basis.rw/auth/register" />
        <meta property="og:image" content="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%9A%8C%3C/text%3E%3C/svg%3E" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%9A%8C%3C/text%3E%3C/svg%3E" />
        <link rel="canonical" href="https://transport.basis.rw/auth/register" />
      </Helmet>
      <nav className="w-full flex items-center px-8 py-3 bg-gradient-to-r from-primary/10 to-white border-b border-gray-200 shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/80 transition-colors duration-200">
          <span className="text-3xl">🚌</span>
          <span>Basis Transport</span>
        </Link>
      </nav>
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
    </>
  );
};

export default Signup; 