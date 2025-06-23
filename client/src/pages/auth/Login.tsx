import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { Heading } from '@/components/inputs/TextInputs';
import validateInputs from '@/helpers/validations.helper';
import { useLogin } from '@/usecases/auth/auth.hooks';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Login = () => {
  /**
   * STATE VARIABLES
   */
  const [showPassword, setShowPassword] = useState(false);

  // LOGIN USECASES
  const { login, loginIsLoading } = useLogin();

  /**
   * REACT HOOK FORM
   */
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // HANDLE FORM SUBMIT
  const onSubmit = handleSubmit((data) => {
    login({
      email: data?.email,
      password: data?.password,
    });
  });
  return (
    <>
      <Helmet>
        <title>Login | Basis Transport</title>
        <meta name="description" content="Login to Basis Transport to access real-time bus tracking, seat availability, and public transport analytics. Secure and fast access for commuters and operators." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Basis Transport Team" />
        <meta property="og:title" content="Login | Basis Transport" />
        <meta property="og:description" content="Login to Basis Transport to access real-time bus tracking, seat availability, and public transport analytics." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://transport.basis.rw/auth/login" />
        <meta property="og:image" content="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%9A%8C%3C/text%3E%3C/svg%3E" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%F0%9F%9A%8C%3C/text%3E%3C/svg%3E" />
        <link rel="canonical" href="https://transport.basis.rw/auth/login" />
      </Helmet>
      <nav className="w-full flex items-center px-8 py-3 bg-gradient-to-r from-primary/10 to-white border-b border-gray-200 shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/80 transition-colors duration-200">
          <span className="text-3xl">🚌</span>
          <span>Basis Transport</span>
        </Link>
      </nav>
      <main className="w-full h-screen items-center justify-center flex flex-col gap-4">
        <form
          className="w-full py-8 max-w-[35%] sm:max-w-[35%] md:max-w-[35%] lg:max-w-[35%] shadow-md rounded-md bg-white p-8 mx-auto flex flex-col gap-4"
          onSubmit={onSubmit}
        >
          <header className="flex flex-col gap-2 items-center mb-4">
            <Heading type="h1">Welcome Back</Heading>
            <p className="text-sm text-secondary">
              Please sign in to your account
            </p>
          </header>
          <fieldset className="w-full flex flex-col gap-5">
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
              name="password"
              rules={{
                required: `Please enter your password`,
              }}
              render={({ field }) => (
                <Input
                  {...field}
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
          <menu className="w-full flex items-center justify-between gap-2">
            <Controller
              control={control}
              name="rememberMe"
              render={({ field }) => (
                <Input
                  type="checkbox"
                  label="Remember me"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Link
              to="/auth/forgot-password"
              className="text-secondary text-sm hover:underline hover:text-primary transition-colors duration-200"
            >
              Forgot Password?
            </Link>
          </menu>
          <menu className="w-full flex flex-col items-center justify-between gap-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={loginIsLoading}
              primary
            >
              Login
            </Button>
            <p className="text-sm text-secondary">
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                className="text-primary hover:underline transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </menu>
        </form>
      </main>
    </>
  );
};

export default Login;
