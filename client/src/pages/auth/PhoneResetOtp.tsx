import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import validateInputs from "@/helpers/validations.helper";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/seo";
import PublicLayout from "@/containers/public/PublicLayout";
import PublicNavbar from "@/containers/public/PublicNavbar";
import { publicColors } from "@/containers/public/publicTheme";
import { toast } from "sonner";
import {
  useResetPasswordWithPhone,
  useSendPhoneResetOtp,
  useVerifyPhoneResetOtp,
} from "@/usecases/auth/auth.hooks";

type ResetStep = "otp" | "password";

type OtpForm = {
  otp: string;
};

type PasswordForm = {
  password: string;
  confirmPassword: string;
};

const PhoneResetOtp = () => {
  const [searchParams] = useSearchParams();
  const phoneNumber = searchParams.get("phone");
  const navigate = useNavigate();

  const [step, setStep] = useState<ResetStep>("otp");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { sendPhoneResetOtp, isLoading: sendPhoneResetOtpIsLoading } =
    useSendPhoneResetOtp();
  const { verifyPhoneResetOtp, verifyPhoneResetOtpIsLoading } =
    useVerifyPhoneResetOtp();
  const { resetPasswordWithPhone, resetPasswordWithPhoneIsLoading } =
    useResetPasswordWithPhone();

  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    reset: resetOtpForm,
  } = useForm<OtpForm>();

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    watch,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>();

  const passwordValue = watch("password");

  const onSubmitOtp = handleOtpSubmit(async (data) => {
    if (!phoneNumber) {
      toast.error("Phone number is missing. Request a new reset code.");
      return;
    }

    try {
      const response = await verifyPhoneResetOtp({
        phoneNumber,
        otp: data.otp,
      });
      setResetToken(response.resetToken);
      setStep("password");
      resetOtpForm();
      toast.success("Code verified. You can now set a new password.");
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
          ? String((err.data as { message: string }).message)
          : "Something went wrong";
      toast.error(message);
    }
  });

  const onSubmitPassword = handlePasswordSubmit(async (data) => {
    if (!phoneNumber || !resetToken) {
      toast.error("Reset session expired. Verify the code again.");
      setStep("otp");
      return;
    }

    try {
      const response = await resetPasswordWithPhone({
        phoneNumber,
        resetToken,
        password: data.password,
      });
      toast.success(response.message);
      navigate("/auth/login");
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
          ? String((err.data as { message: string }).message)
          : "Something went wrong";
      toast.error(message);
    }
  });

  const onResendCode = async () => {
    if (!phoneNumber) {
      toast.error("Phone number is missing. Request a new reset code.");
      return;
    }

    try {
      sendPhoneResetOtp({ phoneNumber });
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
          ? String((err.data as { message: string }).message)
          : "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <>
      <Seo
        title="Phone reset verification | Basis Transport"
        description="Verify your phone reset code to set a new Basis Transport account password."
        canonicalPath="/auth/reset-phone-otp"
        author={false}
        noIndex
        openGraph={false}
      />
      <PublicLayout>
        <PublicNavbar variant="auth" />
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-4 lg:px-8 pt-24 pb-12">
          {!phoneNumber ? (
            <div className="w-full max-w-[420px] shadow-lg rounded-2xl bg-white/90 border border-primary/10 p-8 mx-auto flex flex-col gap-4 animate-fade-in-up text-center">
              <h1
                className="text-3xl lg:text-4xl leading-tight font-light text-balance"
                style={{ color: publicColors.primary }}
              >
                Phone missing
              </h1>
              <p
                className="text-base leading-relaxed"
                style={{ color: publicColors.neutralLight }}
              >
                This page needs a phone number. Request a new reset code below.
              </p>
              <Link
                to="/auth/forgot-password"
                className="text-primary hover:underline transition-colors duration-200 ease-in-out text-sm"
              >
                Request a reset code
              </Link>
            </div>
          ) : (
            <form
              className="w-full max-w-[420px] shadow-lg rounded-2xl bg-white/90 border border-primary/10 p-8 mx-auto flex flex-col gap-4 animate-fade-in-up"
              onSubmit={step === "otp" ? onSubmitOtp : onSubmitPassword}
            >
              <header className="flex flex-col gap-2 items-center mb-4">
                <h1
                  className="text-3xl lg:text-4xl leading-tight font-light text-balance text-center"
                  style={{ color: publicColors.primary }}
                >
                  {step === "otp" ? "Verify code" : "Set new password"}
                </h1>
                <p
                  className="text-base leading-relaxed text-center"
                  style={{ color: publicColors.neutralLight }}
                >
                  {step === "otp"
                    ? "Enter the 6-digit code sent to your phone number."
                    : "Choose a strong password for your account."}
                </p>
                <p
                  className="text-sm text-center"
                  style={{ color: publicColors.neutralLight }}
                >
                  Using {phoneNumber}
                </p>
              </header>

              {step === "otp" ? (
                <fieldset className="w-full flex flex-col gap-5">
                  <Controller
                    control={otpControl}
                    name="otp"
                    rules={{
                      required: "Please enter the verification code",
                      validate: (value) =>
                        /^\d{6}$/.test(String(value || "")) ||
                        "Enter 6 numbers",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        errorMessage={otpErrors.otp?.message}
                        placeholder="Enter 6-digit code"
                        label="6-digit code"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        required
                      />
                    )}
                  />
                </fieldset>
              ) : (
                <fieldset className="w-full flex flex-col gap-5">
                  <Controller
                    control={passwordControl}
                    name="password"
                    rules={{
                      required: `Please enter a password`,
                      validate: (value) =>
                        validateInputs(value, "password") ||
                        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        errorMessage={passwordErrors.password?.message}
                        placeholder="New password"
                        label="New password"
                        autoComplete="new-password"
                        required
                        type={showPassword ? "text" : "password"}
                        suffixIcon={showPassword ? faEyeSlash : faEye}
                        suffixIconHandler={(e) => {
                          e.preventDefault();
                          setShowPassword(!showPassword);
                        }}
                      />
                    )}
                  />
                  <Controller
                    control={passwordControl}
                    name="confirmPassword"
                    rules={{
                      required: `Please confirm your password`,
                      validate: (value) =>
                        value === passwordValue || "Passwords do not match",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        errorMessage={passwordErrors.confirmPassword?.message}
                        placeholder="Confirm new password"
                        label="Confirm password"
                        autoComplete="new-password"
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        suffixIcon={showConfirmPassword ? faEyeSlash : faEye}
                        suffixIconHandler={(e) => {
                          e.preventDefault();
                          setShowConfirmPassword(!showConfirmPassword);
                        }}
                      />
                    )}
                  />
                </fieldset>
              )}

              <menu className="w-full flex flex-col items-center gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={
                    step === "otp"
                      ? verifyPhoneResetOtpIsLoading
                      : resetPasswordWithPhoneIsLoading
                  }
                  primary
                >
                  {step === "otp" ? "Verify code" : "Update password"}
                </Button>
                {step === "otp" ? (
                  <Link
                    to="#"
                    className="text-sm text-primary hover:underline transition-colors duration-200 ease-in-out"
                    onClick={(e) => {
                      e.preventDefault();
                      onResendCode();
                    }}
                  >
                    {sendPhoneResetOtpIsLoading
                      ? "Resending..."
                      : "Resend code"}
                  </Link>
                ) : (
                  <Link
                    to="#"
                    className="text-sm text-primary hover:underline transition-colors duration-200 ease-in-out"
                    onClick={(e) => {
                      e.preventDefault();
                      setStep("otp");
                      setResetToken(null);
                    }}
                  >
                    Verify a different code
                  </Link>
                )}
                <Link
                  to="/auth/login"
                  className="text-[11px] text-primary hover:underline transition-colors duration-200 ease-in-out"
                  style={{ color: publicColors.neutralLight }}
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

export default PhoneResetOtp;
