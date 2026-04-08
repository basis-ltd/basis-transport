import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/seo";
import PublicLayout from "@/containers/public/PublicLayout";
import PublicNavbar from "@/containers/public/PublicNavbar";
import { publicColors } from "@/containers/public/publicTheme";
import { toast } from "sonner";
import { useSendPhoneResetOtp, useVerifyPhoneResetOtp } from "@/usecases/auth/auth.hooks";

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
              onSubmit={onSubmitOtp}
            >
              <header className="flex flex-col gap-2 items-center mb-4">
                <h1
                  className="text-3xl lg:text-4xl leading-tight font-light text-balance text-center"
                  style={{ color: publicColors.primary }}
                >
                  Verify code
                </h1>
                <p
                  className="text-base leading-relaxed text-center"
                  style={{ color: publicColors.neutralLight }}
                >
                  Enter the 6-digit code sent to your phone number.
                </p>
                <p
                  className="text-sm text-center"
                  style={{ color: publicColors.neutralLight }}
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
                  className="w-full"
                  isLoading={verifyPhoneResetOtpIsLoading}
                  primary
                >
                  Verify code
                </Button>
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
