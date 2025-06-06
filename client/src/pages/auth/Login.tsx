import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { Heading } from '@/components/inputs/TextInputs';
import validateInputs from '@/helpers/validations.helper';
import { useLogin } from '@/usecases/auth/auth.hooks';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

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
          <Button type="submit" className='w-full' isLoading={loginIsLoading} primary>
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
  );
};

export default Login;
