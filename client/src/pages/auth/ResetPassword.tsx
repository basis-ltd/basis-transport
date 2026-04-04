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
import { publicColors } from '@/containers/public/publicTheme';
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
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-4 lg:px-8 pt-24 pb-12">
          {!token ? (
            <div
              className="w-full max-w-[420px] shadow-lg rounded-2xl bg-white/90 border border-primary/10 p-8 mx-auto flex flex-col gap-4 animate-fade-in-up text-center"
            >
              <h1
                className="text-3xl lg:text-4xl leading-tight font-light text-balance"
                style={{ color: publicColors.primary }}
              >
                Link invalid
              </h1>
              <p
                className="text-base leading-relaxed"
                style={{ color: publicColors.neutralLight }}
              >
                This password reset link is missing or invalid. Request a new
                one below.
              </p>
              <Link
                to="/auth/forgot-password"
                className="text-primary hover:underline transition-colors duration-200 ease-in-out text-sm"
              >
                Request a new reset link
              </Link>
              <Link
                to="/auth/login"
                className="text-sm"
                style={{ color: publicColors.neutralLight }}
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form
              className="w-full max-w-[420px] shadow-lg rounded-2xl bg-white/90 border border-primary/10 p-8 mx-auto flex flex-col gap-4 animate-fade-in-up"
              onSubmit={onSubmit}
            >
              <header className="flex flex-col gap-2 items-center mb-4">
                <h1
                  className="text-3xl lg:text-4xl leading-tight font-light text-balance text-center"
                  style={{ color: publicColors.primary }}
                >
                  New password
                </h1>
                <p
                  className="text-base leading-relaxed text-center"
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
                  className="w-full"
                  isLoading={isLoading}
                  primary
                >
                  Update password
                </Button>
                <Link
                  to="/auth/login"
                  className="text-sm text-primary hover:underline transition-colors duration-200 ease-in-out"
                >
                  Back to login
                </Link>
              </menu>
            </form>
          )}
        </div>
      </PublicLayout>
    </>
  );
};

export default ResetPassword;
