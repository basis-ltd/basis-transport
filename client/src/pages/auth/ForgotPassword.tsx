import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import validateInputs from '@/helpers/validations.helper';
import { useForgotPasswordMutation } from '@/api/mutations/apiSlice';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import { publicColors } from '@/containers/public/publicTheme';
import { toast } from 'sonner';

type ForgotForm = {
  email: string;
};

const ForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotForm>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await forgotPassword({ email: data.email }).unwrap();
      toast.success(res.message);
      reset();
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
        title="Forgot password | Basis Transport"
        description="Request a link to reset your Basis Transport account password."
        canonicalPath="/auth/forgot-password"
        author={false}
        noIndex
        openGraph={false}
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
                Forgot password
              </h1>
              <p
                className="text-base leading-relaxed text-center"
                style={{ color: publicColors.neutralLight }}
              >
                Enter your email and we&apos;ll send you a reset link if an
                account exists.
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
            </fieldset>
            <menu className="w-full flex flex-col items-center gap-2">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                primary
              >
                Send reset link
              </Button>
              <p className="text-sm" style={{ color: publicColors.neutralLight }}>
                Remember your password?{' '}
                <Link
                  to="/auth/login"
                  className="text-primary hover:underline transition-colors duration-200 ease-in-out text-[11px] lg:text-[12px]"
                >
                  Back to login
                </Link>
              </p>
            </menu>
          </form>
        </div>
      </PublicLayout>
    </>
  );
};

export default ForgotPassword;
