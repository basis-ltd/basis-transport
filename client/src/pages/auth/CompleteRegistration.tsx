import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import { Seo } from '@/components/seo';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import { publicColors } from '@/containers/public/publicTheme';
import validateInputs from '@/helpers/validations.helper';
import { useAppSelector } from '@/states/hooks';
import { useCompleteRegistration } from '@/usecases/auth/auth.hooks';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CompleteRegistrationForm {
  email?: string;
  password: string;
  confirmPassword: string;
}

const CompleteRegistration = () => {
  const navigate = useNavigate();
  const { user, token, isHydrated } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { completeRegistration, completeRegistrationIsLoading } =
    useCompleteRegistration();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteRegistrationForm>();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user || !token) {
      navigate('/auth/login');
      return;
    }

    if (!user.mustCompleteRegistration) {
      navigate('/dashboard');
    }
  }, [isHydrated, navigate, token, user]);

  const onSubmit = handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await completeRegistration({
        email: data.email || undefined,
        password: data.password,
      });
    } catch (error) {
      toast.error(
        (
          error as {
            data?: {
              message?: string;
            };
          }
        )?.data?.message || 'Unable to complete registration'
      );
    }
  });

  return (
    <>
      <Seo
        title="Complete Registration | Basis Transport"
        description="Complete your registration to continue using Basis Transport."
        canonicalPath="/auth/complete-registration"
      />
      <PublicLayout>
        <PublicNavbar variant="auth" />
        <main className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-4 lg:px-8 pt-24 pb-12">
          <section className="w-full max-w-[420px] shadow-sm rounded-md bg-white/90 p-8 mx-auto flex flex-col gap-4 animate-fade-in-up">
            <header className="flex flex-col gap-2 items-center mb-2">
              <h1
                className="text-[13px] leading-tight font-semibold text-center"
                style={{ color: publicColors.primary }}
              >
                Complete Registration
              </h1>
              <p
                className="text-[12px] leading-relaxed text-center font-light"
                style={{ color: publicColors.neutralLight }}
              >
                Set your password to continue. Email is optional.
              </p>
            </header>

            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <fieldset className="w-full flex flex-col gap-5">
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
                      type="email"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Please enter your password',
                    validate: (value) =>
                      validateInputs(value, 'password') ||
                      'Password must include uppercase, lowercase, number, and special character',
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
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: 'Please confirm your password',
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      errorMessage={errors.confirmPassword?.message}
                      placeholder="Confirm password"
                      label="Confirm Password"
                      autoComplete="new-password"
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      suffixIcon={showConfirmPassword ? faEyeSlash : faEye}
                      suffixIconHandler={(e) => {
                        e.preventDefault();
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                    />
                  )}
                />
              </fieldset>

              <Button
                type="submit"
                className="w-full"
                isLoading={completeRegistrationIsLoading}
                primary
              >
                Complete Registration
              </Button>
            </form>
          </section>
        </main>
      </PublicLayout>
    </>
  );
};

export default CompleteRegistration;
