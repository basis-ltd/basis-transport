import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import validateInputs from '@/helpers/validations.helper';
import { useSignup } from '@/usecases/auth/auth.hooks';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import { publicColors } from '@/containers/public/publicTheme';

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
      <PublicLayout>
        <PublicNavbar variant="auth" />
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-4 lg:px-8 pt-24 pb-12">
          <form
            className="w-full max-w-[420px] shadow-lg rounded-2xl bg-white/90 border border-primary/10 p-8 mx-auto flex flex-col gap-4 animate-fade-in-up"
            onSubmit={onSubmit}
          >
            <header className="flex flex-col gap-2 items-center mb-4">
              <h1
                className="text-3xl lg:text-4xl leading-tight font-light text-balance text-center"
                style={{ color: publicColors.primary }}
              >
                Create Account
              </h1>
              <p
                className="text-base leading-relaxed text-center"
                style={{ color: publicColors.neutralLight }}
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
                  className="w-full"
                  isLoading={signupIsLoading}
                  primary
                >
                  Sign Up
                </Button>
                <p className="text-sm" style={{ color: publicColors.neutralLight }}>
                  Already have an account?{' '}
                  <Link
                    to="/auth/login"
                    className="text-primary hover:underline transition-colors duration-200 ease-in-out text-[11px] lg:text-[12px]"
                  >
                    Login
                  </Link>
                </p>
              </menu>
            </footer>
          </form>
        </div>
      </PublicLayout>
    </>
  );
};

export default Signup;
