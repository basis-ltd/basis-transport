import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import validateInputs from '@/helpers/validations.helper';
import { useLogin } from '@/usecases/auth/auth.hooks';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import { publicColors } from '@/containers/public/publicTheme';

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
      <Seo
        title="Login | Basis Transport"
        description="Login to Basis Transport to access real-time bus tracking, seat availability, and public transport analytics. Secure and fast access for commuters and operators."
        canonicalPath="/auth/login"
        ogDescription="Login to Basis Transport to access real-time bus tracking, seat availability, and public transport analytics."
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
                Welcome Back
              </h1>
              <p
                className="text-base leading-relaxed text-center"
                style={{ color: publicColors.neutralLight }}
              >
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
                    autoComplete="email"
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
                    autoComplete="current-password"
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
                className="text-sm text-primary hover:underline transition-colors duration-200 ease-in-out"
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
              <p className="text-sm" style={{ color: publicColors.neutralLight }}>
                Don&apos;t have an account?{' '}
                <Link
                  to="/auth/register"
                  className="text-primary hover:underline transition-colors duration-200 ease-in-out text-[11px] lg:text-[12px]"
                >
                  Sign up
                </Link>
              </p>
            </menu>
          </form>
        </div>
      </PublicLayout>
    </>
  );
};

export default Login;
