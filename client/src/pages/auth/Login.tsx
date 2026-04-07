import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import validateInputs from '@/helpers/validations.helper';
import {
  useLogin,
  usePhoneLoginPrecheck,
  useSendPhoneOtp,
  useVerifyPhoneOtp,
} from '@/usecases/auth/auth.hooks';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import { publicColors } from '@/containers/public/publicTheme';
import { toast } from 'sonner';

type LoginTab = 'username' | 'phone';
type PhoneStep = 'precheck' | 'password' | 'otp';

interface UsernameLoginForm {
  username: string;
  password: string;
}

interface PhonePrecheckForm {
  phoneNumber: string;
}

interface PhonePasswordForm {
  password: string;
}

interface PhoneOtpForm {
  otp: string;
}

const Login = () => {
  const [activeTab, setActiveTab] = useState<LoginTab>('username');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('precheck');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPhonePassword, setShowPhonePassword] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  // AUTH USECASES
  const { login, loginIsLoading } = useLogin();
  const { runPrecheck, precheckIsLoading } = usePhoneLoginPrecheck();
  const { sendPhoneOtp, sendPhoneOtpIsLoading } = useSendPhoneOtp();
  const { verifyPhoneOtp, verifyPhoneOtpIsLoading } = useVerifyPhoneOtp();

  const {
    control,
    handleSubmit,
    setFocus: setUsernameFocus,
    formState: { errors },
  } = useForm<UsernameLoginForm>();

  const {
    control: precheckControl,
    handleSubmit: handlePrecheckSubmit,
    setFocus: setPrecheckFocus,
    formState: { errors: precheckErrors },
  } = useForm<PhonePrecheckForm>();

  const {
    control: phonePasswordControl,
    handleSubmit: handlePhonePasswordSubmit,
    setFocus: setPhonePasswordFocus,
    formState: { errors: phonePasswordErrors },
  } = useForm<PhonePasswordForm>();

  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    setFocus: setOtpFocus,
    formState: { errors: otpErrors },
  } = useForm<PhoneOtpForm>();

  const maskedPhoneNumber = useMemo(() => {
    const trimmed = phoneNumber.replace(/\s+/g, '');
    if (trimmed.length < 4) {
      return phoneNumber;
    }

    const prefix = trimmed.slice(0, 6);
    const suffix = trimmed.slice(-2);
    return `${prefix} **** ${suffix}`;
  }, [phoneNumber]);

  const readApiError = (error: unknown) =>
    (
      error as {
        data?: {
          message?: string;
        };
      }
    )?.data?.message || 'Something went wrong';

  const onUsernameSubmit = handleSubmit((data) => {
    login({
      username: data?.username,
      password: data?.password,
    });
  });

  const onPhonePrecheckSubmit = handlePrecheckSubmit(async (data) => {
    try {
      const payload = await runPrecheck({ phoneNumber: data.phoneNumber });
      setPhoneNumber(data.phoneNumber);

      if (payload?.hasPassword) {
        setPhoneStep('password');
        setLiveMessage('Phone found. Enter your password to continue.');
        return;
      }

      await sendPhoneOtp({ phoneNumber: data.phoneNumber });
      setLiveMessage('Code sent. Enter the 6-digit code to continue.');
      setPhoneStep('otp');
    } catch (error) {
      const message = readApiError(error);
      setLiveMessage(message);
      toast.error(message);
    }
  });

  const onPhonePasswordSubmit = handlePhonePasswordSubmit((data) => {
    login({
      username: phoneNumber,
      password: data.password,
    });
  });

  const onOtpSubmit = handleOtpSubmit(async (data) => {
    try {
      await verifyPhoneOtp({
        phoneNumber,
        otp: data.otp,
      });
    } catch (error) {
      const message = readApiError(error);
      setLiveMessage(message);
      toast.error(message);
    }
  });

  const onResendOtp = async () => {
    try {
      await sendPhoneOtp({ phoneNumber });
      setLiveMessage('A new code has been sent to your phone.');
    } catch (error) {
      const message = readApiError(error);
      setLiveMessage(message);
      toast.error(message);
    }
  };

  const switchTab = (tab: LoginTab) => {
    setActiveTab(tab);
    setPhoneStep('precheck');
    setPhoneNumber('');
    setLiveMessage('');
  };

  useEffect(() => {
    if (activeTab === 'username') {
      setUsernameFocus('username');
      return;
    }

    if (phoneStep === 'precheck') {
      setPrecheckFocus('phoneNumber');
      return;
    }

    if (phoneStep === 'password') {
      setPhonePasswordFocus('password');
      return;
    }

    setOtpFocus('otp');
  }, [
    activeTab,
    phoneStep,
    setOtpFocus,
    setPhonePasswordFocus,
    setPrecheckFocus,
    setUsernameFocus,
  ]);

  const phoneStepTitle =
    phoneStep === 'precheck'
      ? 'Step 1 of 2: Enter your phone number'
      : phoneStep === 'password'
        ? 'Step 2 of 2: Enter your password'
        : 'Step 2 of 2: Enter the code';

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
        <main className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-4 lg:px-8 pt-24 pb-12">
          <section className="w-full max-w-[420px] shadow-sm rounded-md bg-white/90 p-8 mx-auto flex flex-col gap-4 animate-fade-in-up">
            <header className="flex flex-col gap-2 items-center mb-2">
              <h1
                className="text-[13px] leading-tight font-semibold text-center"
                style={{ color: publicColors.primary }}
              >
                Welcome Back
              </h1>
              <p
                className="text-[12px] leading-relaxed text-center font-light"
                style={{ color: publicColors.neutralLight }}
              >
                Please sign in to your account
              </p>
            </header>
            <nav className="grid grid-cols-2 gap-2" aria-label="Login mode">
              <Link
                to="#"
                className={`h-10 rounded-md text-[12px] font-light transition-colors duration-200 ease-in-out flex items-center justify-center ${
                  activeTab === 'username'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-primary/10 text-primary'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  switchTab('username');
                }}
              >
                Email or Phone
              </Link>
              <Link
                to="#"
                className={`h-10 rounded-md text-[12px] font-light transition-colors duration-200 ease-in-out flex items-center justify-center ${
                  activeTab === 'phone'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-primary/10 text-primary'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  switchTab('phone');
                }}
              >
                Phone only
              </Link>
            </nav>
            <p
              className="text-[12px] font-light text-center"
              style={{ color: publicColors.neutralLight }}
            >
              Use phone only if you joined without a password.
            </p>

            <p
              aria-live="polite"
              role="status"
              className={`text-[12px] font-light text-center rounded-md bg-primary/5 px-3 py-2 ${
                liveMessage ? 'block' : 'hidden'
              }`}
              style={{ color: publicColors.primary }}
            >
              {liveMessage}
            </p>

            {activeTab === 'username' ? (
              <form className="flex flex-col gap-4" onSubmit={onUsernameSubmit}>
                <fieldset className="w-full flex flex-col gap-5">
                  <Controller
                    control={control}
                    name="username"
                    rules={{
                      required: 'Please enter your email or phone number',
                      validate: (value) =>
                        validateInputs(value, 'username') ||
                        'Please enter a valid email or phone number',
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        errorMessage={errors.username?.message}
                        placeholder="Enter email or phone number"
                        label="Email or phone number"
                        autoComplete="username"
                        required
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="password"
                    rules={{
                      required: 'Please enter your password',
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        errorMessage={errors.password?.message}
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
                <footer className="w-full flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={loginIsLoading}
                    primary
                  >
                    Sign in
                  </Button>
                  <Link
                    to="/auth/forgot-password"
                    className="text-[12px] font-light hover:underline transition-colors duration-200 ease-in-out text-center"
                    style={{ color: publicColors.neutralLight }}
                  >
                    Forgot your password?
                  </Link>
                </footer>
              </form>
            ) : null}

            {activeTab === 'phone' ? (
              <form
                className="flex flex-col gap-4"
                onSubmit={
                  phoneStep === 'precheck'
                    ? onPhonePrecheckSubmit
                    : phoneStep === 'password'
                      ? onPhonePasswordSubmit
                      : onOtpSubmit
                }
              >
                <header className="flex flex-col gap-1">
                  <p
                    className="text-[12px] font-medium"
                    style={{ color: publicColors.primary }}
                  >
                    {phoneStepTitle}
                  </p>
                  {phoneStep !== 'precheck' ? (
                    <p
                      className="text-[12px] font-light"
                      style={{ color: publicColors.neutralLight }}
                    >
                      Using {maskedPhoneNumber}
                    </p>
                  ) : null}
                </header>

                {phoneStep === 'precheck' ? (
                  <fieldset className="w-full flex flex-col gap-5">
                    <Controller
                      control={precheckControl}
                      name="phoneNumber"
                      rules={{
                        required: 'Please enter your phone number',
                        validate: (value) =>
                          validateInputs(value, 'phone') ||
                          'Please enter a valid phone number',
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          errorMessage={precheckErrors.phoneNumber?.message}
                          placeholder="Enter phone number"
                          label="Phone Number"
                          autoComplete="tel"
                          type="tel"
                          required
                        />
                      )}
                    />
                  </fieldset>
                ) : null}

                {phoneStep === 'password' ? (
                  <fieldset className="w-full flex flex-col gap-5">
                    <p
                      className="text-[12px] font-light"
                      style={{ color: publicColors.neutralLight }}
                    >
                      This phone already has a password. Enter it to continue.
                    </p>
                    <Controller
                      control={phonePasswordControl}
                      name="password"
                      rules={{
                        required: 'Please enter your password',
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          errorMessage={phonePasswordErrors.password?.message}
                          placeholder="Enter password"
                          label="Password"
                          autoComplete="current-password"
                          required
                          type={showPhonePassword ? 'text' : 'password'}
                          suffixIcon={showPhonePassword ? faEyeSlash : faEye}
                          suffixIconHandler={(e) => {
                            e.preventDefault();
                            setShowPhonePassword(!showPhonePassword);
                          }}
                        />
                      )}
                    />
                  </fieldset>
                ) : null}

                {phoneStep === 'otp' ? (
                  <fieldset className="w-full flex flex-col gap-5">
                    <p
                      className="text-[12px] font-light"
                      style={{ color: publicColors.neutralLight }}
                    >
                      Enter the 6-digit code sent to your phone.
                    </p>
                    <Controller
                      control={otpControl}
                      name="otp"
                      rules={{
                        required: 'Please enter the verification code',
                        validate: (value) =>
                          /^\d{6}$/.test(String(value || '')) || 'Enter 6 numbers',
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          errorMessage={otpErrors.otp?.message}
                          placeholder="Enter 6-digit code"
                          label="6-digit code"
                          autoComplete="one-time-code"
                          required
                          inputMode="numeric"
                        />
                      )}
                    />
                    <p
                      className="text-[12px] font-light"
                      style={{ color: publicColors.neutralLight }}
                    >
                      Did not get it? Wait 60s, then resend.
                    </p>
                  </fieldset>
                ) : null}

                <footer className="w-full flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={
                      loginIsLoading ||
                      precheckIsLoading ||
                      sendPhoneOtpIsLoading ||
                      verifyPhoneOtpIsLoading
                    }
                    primary
                  >
                    {phoneStep === 'precheck'
                      ? 'Continue'
                      : phoneStep === 'password'
                        ? 'Sign in'
                        : 'Verify and continue'}
                  </Button>
                  {phoneStep === 'password' ? (
                    <Link
                      to="/auth/forgot-password"
                      className="text-[12px] font-light hover:underline underline-offset-2 transition-colors duration-200 ease-in-out text-center"
                      style={{ color: publicColors.neutralLight }}
                    >
                      Forgot your password?
                    </Link>
                  ) : null}
                  {phoneStep === 'otp' ? (
                    <Link
                      to="#"
                      className="text-[12px] font-light text-center hover:underline"
                      style={{ color: publicColors.neutralLight }}
                      onClick={(e) => {
                        e.preventDefault();
                        onResendOtp();
                      }}
                    >
                      {sendPhoneOtpIsLoading ? 'Resending...' : 'Resend code'}
                    </Link>
                  ) : null}
                  {phoneStep !== 'precheck' ? (
                    <Link
                      to="/auth/login"
                      className="text-[12px] font-light text-center hover:underline"
                      style={{ color: publicColors.neutralLight }}
                      onClick={(e) => {
                        e.preventDefault();
                        setPhoneStep('precheck');
                      }}
                    >
                      Use a different phone number
                    </Link>
                  ) : null}
                </footer>
              </form>
            ) : null}

            <footer className="w-full flex flex-col items-center justify-between gap-2">
              <p className="text-[12px] font-light" style={{ color: publicColors.neutralLight }}>
                Don&apos;t have an account?{' '}
                <Link
                  to="/auth/register"
                  className="text-primary hover:underline transition-colors duration-200 ease-in-out text-[12px]"
                >
                  Sign up
                </Link>
              </p>
            </footer>
          </section>
        </main>
      </PublicLayout>
    </>
  );
};

export default Login;
