import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import validateInputs from '@/helpers/validations.helper';
import { useResetPasswordMutation } from '@/api/mutations/apiSlice';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Seo } from '@/components/seo';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import { publicClasses, publicColors } from '@/containers/public/publicTheme';
import { toast } from 'sonner';

type ResetForm = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>();

  const passwordValue = watch('password');

  const onSubmit = handleSubmit(async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset link.');
      return;
    }
    try {
      const res = await resetPassword({
        token,
        password: data.password,
      }).unwrap();
      toast.success(res.message);
      navigate('/auth/login');
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'message' in err.data
          ? String((err.data as { message: string }).message)
          : 'Something went wrong';
      toast.error(message);
    }
  });

  return (
    <>
      <Seo
        title="Reset password | Basis Transport"
        description="Set a new password for your Basis Transport account."
        canonicalPath="/auth/reset-password"
        author={false}
        noIndex
        openGraph={false}
      />
      <PublicLayout>
        <PublicNavbar variant="auth" />
        <main className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-4 lg:px-8 pt-24 pb-12">
          {!token ? (
            <section className={`${publicClasses.authCard} text-center`}>
              <h1
                className={`${publicClasses.pageTitle} text-balance`}
                style={{ color: publicColors.primary }}
              >
                Link invalid
              </h1>
              <p
                className={`${publicClasses.bodyMuted} mt-4`}
                style={{ color: publicColors.neutralLight }}
              >
                This password reset link is missing or invalid. Request a new
                one below.
              </p>
              <Link
                to="/auth/forgot-password"
                className="text-[12px] text-primary hover:underline transition-colors duration-200 ease-in-out mt-4 inline-block"
              >
                Request a new reset link
              </Link>
              <Link
                to="/auth/login"
                className="text-[12px] font-light mt-2 inline-block"
                style={{ color: publicColors.neutralLight }}
              >
                Back to login
              </Link>
            </section>
          ) : (
            <form className={publicClasses.authCard} onSubmit={onSubmit}>
              <header className="flex flex-col gap-2 items-center mb-4">
                <h1
                  className={`${publicClasses.pageTitle} text-center text-balance`}
                  style={{ color: publicColors.primary }}
                >
                  New password
                </h1>
                <p
                  className={`${publicClasses.bodyMuted} text-center`}
                  style={{ color: publicColors.neutralLight }}
                >
                  Choose a strong password for your account.
                </p>
              </header>
              <fieldset className="w-full flex flex-col gap-5">
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: `Please enter a password`,
                    validate: (value) =>
                      validateInputs(value, 'password') ||
                      'Password must be at least 8 characters, include uppercase, lowercase, number, and special character',
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      errorMessage={errors.password?.message}
                      placeholder="New password"
                      label="New password"
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
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: `Please confirm your password`,
                    validate: (value) =>
                      value === passwordValue || 'Passwords do not match',
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      errorMessage={errors.confirmPassword?.message}
                      placeholder="Confirm new password"
                      label="Confirm password"
                      autoComplete="new-password"
                      required
                      type={showConfirm ? 'text' : 'password'}
                      suffixIcon={showConfirm ? faEyeSlash : faEye}
                      suffixIconHandler={(e) => {
                        e.preventDefault();
                        setShowConfirm(!showConfirm);
                      }}
                    />
                  )}
                />
              </fieldset>
              <menu className="w-full flex flex-col items-center gap-2">
                <Button
                  type="submit"
                  primary
                    className="w-full"
                  isLoading={isLoading}
                >
                  Update password
                </Button>
                <Link
                  to="/auth/login"
                  className="text-[12px] text-primary hover:underline transition-colors duration-200 ease-in-out"
                >
                  Back to login
                </Link>
              </menu>
            </form>
          )}
        </main>
      </PublicLayout>
    </>
  );
};

export default ResetPassword;
