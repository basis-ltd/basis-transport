import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/seo";
import { toast } from "sonner";
import { useSendPhoneResetOtp, useVerifyPhoneResetOtp } from "@/usecases/auth/auth.hooks";
import {
  AuthPageShell,
} from './AuthPageShell';

type OtpForm = {
  otp: string;
};

const PhoneResetOtp = () => {
  const [searchParams] = useSearchParams();
  const phoneNumber = searchParams.get("phone");
  const navigate = useNavigate();

  const { sendPhoneResetOtp, isLoading: sendPhoneResetOtpIsLoading } =
    useSendPhoneResetOtp();
  const { verifyPhoneResetOtp, verifyPhoneResetOtpIsLoading } =
    useVerifyPhoneResetOtp();

  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    reset: resetOtpForm,
  } = useForm<OtpForm>();

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
      resetOtpForm();
      toast.success("Code verified. You can now set a new password.");
      navigate(`/auth/reset-password?token=${encodeURIComponent(response.token)}`);
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
      <AuthPageShell>
          {!phoneNumber ? (
            <section className="card-framed flex w-full flex-col gap-5 p-8 text-center max-sm:p-5">
              <h1
                className="text-balance text-(--ink)"
              >
                Phone missing
              </h1>
              <p
                className="type-body-sm mt-4 text-(--muted)"
              >
                This page needs a phone number. Request a new reset code below.
              </p>
              <Link
                to="/auth/forgot-password"
                className="type-body-sm text-(--ink) hover:underline transition-colors duration-200 ease-in-out mt-4 inline-block"
              >
                Request a reset code
              </Link>
            </section>
          ) : (
            <form className="card-framed flex w-full flex-col gap-5 p-8 max-sm:p-5" onSubmit={onSubmitOtp}>
              <header className="flex flex-col gap-2 items-center mb-4">
                <h1
                  className="text-center text-balance text-(--ink)"
                >
                  Verify code
                </h1>
                <p
                  className="type-body-sm text-center text-(--muted)"
                >
                  Enter the 6-digit code sent to your phone number.
                </p>
                <p
                  className="type-body-sm text-center text-(--muted)"
                >
                  Using {phoneNumber}
                </p>
              </header>
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

              <menu className="w-full flex flex-col items-center gap-2">
                <Button
                  type="submit"
                  primary
                    className="w-full"
                  isLoading={verifyPhoneResetOtpIsLoading}
                >
                  Verify code
                </Button>
                <Link
                  to="#"
                  className="type-body-sm text-(--ink) hover:underline transition-colors duration-200 ease-in-out"
                  onClick={(e) => {
                    e.preventDefault();
                    onResendCode();
                  }}
                >
                  {sendPhoneResetOtpIsLoading
                    ? "Resending..."
                    : "Resend code"}
                </Link>
                <Link
                  to="/auth/login"
                  className="type-body-sm hover:underline transition-colors duration-200 ease-in-out text-(--muted)"
                >
                  Back to login
                </Link>
              </menu>
            </form>
          )}
      </AuthPageShell>
    </>
  );
};

export default PhoneResetOtp;
