import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import TelInput from '@/components/inputs/TelInput';
import validateInputs, { normalizePhoneNumber } from '@/helpers/validations.helper';
import { formatPhoneForDisplay, validatePhoneNumber } from '@/utils/phone.util';
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
import { toast } from 'sonner';
import {
  AuthPageShell,
  AuthTabs,
} from './AuthPageShell';

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
    const formatted = formatPhoneForDisplay(phoneNumber) || phoneNumber;
    const trimmed = formatted.replace(/\s+/g, '');
    if (trimmed.length < 4) {
      return formatted;
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
      const normalizedPhone =
        normalizePhoneNumber(data.phoneNumber) ?? data.phoneNumber;
      const payload = await runPrecheck({ phoneNumber: normalizedPhone });
      setPhoneNumber(normalizedPhone);

      if (payload?.hasPassword) {
        setPhoneStep('password');
        setLiveMessage('Phone found. Enter your password to continue.');
        return;
      }

      await sendPhoneOtp({ phoneNumber: normalizedPhone });
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
      <AuthPageShell>
          <section className="card-framed flex w-full flex-col gap-5 p-8 max-sm:p-5">
            <header className="flex flex-col gap-2 items-center mb-2">
              <h1
                className="type-h3 text-center text-(--ink)"
              >
                Welcome Back
              </h1>
              <p
                className="type-body-sm text-center text-(--muted)"
              >
                Please sign in to your account
              </p>
            </header>
            <AuthTabs
              label="Login mode"
              value={activeTab}
              onChange={switchTab}
              options={[
                { label: 'Email or Phone', value: 'username' },
                { label: 'Phone only', value: 'phone' },
              ]}
            />
            <p
              className="type-body-sm text-center text-(--muted)"
            >
              Use phone only if you joined without a password.
            </p>

            <p
              aria-live="polite"
              role="status"
              className={`type-body-sm text-center rounded-md bg-(--surface) px-3 py-2 ${
                liveMessage ? 'block' : 'hidden'
              } text-(--ink)`}
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
                    primary
                    className="w-full"
                    isLoading={loginIsLoading}
                  >
                    Sign in
                  </Button>
                  <Link
                    to="/auth/forgot-password"
                    className="type-body-sm hover:underline transition-colors duration-200 ease-in-out text-center text-(--muted)"
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
                    className="type-label text-(--ink)"
                  >
                    {phoneStepTitle}
                  </p>
                  {phoneStep !== 'precheck' ? (
                    <p
                      className="type-body-sm text-(--muted)"
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
                        validate: (value) => validatePhoneNumber(value),
                      }}
                      render={({ field }) => (
                        <TelInput
                          {...field}
                          errorMessage={precheckErrors.phoneNumber?.message}
                          placeholder="7XX XXX XXX"
                          label="Phone Number"
                          autoComplete="tel"
                          required
                        />
                      )}
                    />
                  </fieldset>
                ) : null}

                {phoneStep === 'password' ? (
                  <fieldset className="w-full flex flex-col gap-5">
                    <p
                      className="type-body-sm text-(--muted)"
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
                      className="type-body-sm text-(--muted)"
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
                      className="type-body-sm text-(--muted)"
                    >
                      Did not get it? Wait 60s, then resend.
                    </p>
                  </fieldset>
                ) : null}

                <footer className="w-full flex flex-col gap-2">
                  <Button
                    type="submit"
                    primary
                    className="w-full"
                    isLoading={
                      loginIsLoading ||
                      precheckIsLoading ||
                      sendPhoneOtpIsLoading ||
                      verifyPhoneOtpIsLoading
                    }
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
                      className="type-body-sm hover:underline underline-offset-2 transition-colors duration-200 ease-in-out text-center text-(--muted)"
                    >
                      Forgot your password?
                    </Link>
                  ) : null}
                  {phoneStep === 'otp' ? (
                    <Link
                      to="#"
                      className="type-body-sm text-center hover:underline text-(--muted)"
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
                      className="type-body-sm text-center hover:underline text-(--muted)"
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
              <p className="type-body-sm text-(--muted)">
                Don&apos;t have an account?{' '}
                <Link
                  to="/auth/register"
                  className="text-(--ink) hover:underline transition-colors duration-200 ease-in-out type-body-sm"
                >
                  Sign up
                </Link>
              </p>
            </footer>
          </section>
      </AuthPageShell>
    </>
  );
};

export default Login;
