import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import validateInputs from "@/helpers/validations.helper";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Seo } from "@/components/seo";
import PublicLayout from "@/containers/public/PublicLayout";
import PublicNavbar from "@/containers/public/PublicNavbar";
import { publicColors } from "@/containers/public/publicTheme";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import {
  useForgotPassword,
  useSendPhoneResetOtp,
} from "@/usecases/auth/auth.hooks";
import { Heading } from "@/components/inputs/TextInputs";

const ForgotPassword = () => {
  // NAVIGATION
  const navigate = useNavigate();

  // STATE
  const [method, setMethod] = useState<"email" | "phone">("email");

  // USE CASES
  const {
    forgotPassword,
    isLoading: forgotPasswordIsLoading,
    reset: resetForgotPassword,
    isSuccess: isForgotPasswordSuccess,
  } = useForgotPassword();
  const {
    sendPhoneResetOtp,
    isLoading: sendPhoneResetOtpIsLoading,
    reset: resetSendPhoneResetOtp,
    isSuccess: isSendPhoneResetOtpSuccess,
  } = useSendPhoneResetOtp();

  // FORM
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    watch,
  } = useForm();

  const onSubmit = handleSubmit(async (data) => {
    if (method === "email") {
      forgotPassword({ email: data.email });
    } else {
      sendPhoneResetOtp({ phoneNumber: data.phoneNumber });
    }
  });

  const switchMethod = useCallback(
    (nextMethod: "email" | "phone") => {
      setMethod(nextMethod);
      // Keep both forms isolated when switching tabs.
      reset();
      clearErrors();
    },
    [reset, clearErrors],
  );

  useEffect(() => {
    if (isForgotPasswordSuccess) {
      toast.success(
        `If an account exists for this email, you will receive a reset link shortly.`,
      );
      navigate('/auth/login');
      resetForgotPassword();
      reset();
    }
  }, [isForgotPasswordSuccess, resetForgotPassword, reset, navigate]);

  useEffect(() => {
    if (isSendPhoneResetOtpSuccess) {
      navigate(
        `/auth/reset-phone-otp?phone=${encodeURIComponent(watch('phoneNumber'))}`,
      );
      resetSendPhoneResetOtp();
      reset();
    }
  }, [isSendPhoneResetOtpSuccess, resetSendPhoneResetOtp, reset, navigate, watch]);

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
          <section className="w-full max-w-[420px] shadow-lg rounded-2xl bg-white/90 border border-primary/10 p-8 mx-auto flex flex-col gap-4 animate-fade-in-up">
            <header className="flex flex-col gap-2 items-center mb-4">
              <Heading type="h1" className="text-center">
                Forgot password
              </Heading>
              <p
                className="text-[12px] leading-relaxed text-center"
                style={{ color: publicColors.neutralLight }}
              >
                {method === "email"
                  ? "Enter your email and we'll send you a reset link if an account exists."
                  : "Enter your phone number and we'll send you a reset code if an account exists."}
              </p>
            </header>
            <nav className="grid grid-cols-2 gap-2" aria-label="Reset method">
              <Link
                to="#"
                className={`h-10 rounded-md text-[12px] font-light transition-colors duration-200 ease-in-out flex items-center justify-center ${
                  method === "email"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-primary/10 text-primary"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  switchMethod("email");
                }}
              >
                Email
              </Link>
              <Link
                to="#"
                className={`h-10 rounded-md text-[12px] font-light transition-colors duration-200 ease-in-out flex items-center justify-center ${
                  method === "phone"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-primary/10 text-primary"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  switchMethod("phone");
                }}
              >
                Phone
              </Link>
            </nav>
            <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
              {method === "email" ? (
                <fieldset className="w-full flex flex-col gap-5">
                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      validate: (value) =>
                        validateInputs(value, "email") ||
                        "Please enter a valid email address",
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
              ) : (
                <fieldset className="w-full flex flex-col gap-5">
                  <Controller
                    control={control}
                    name="phoneNumber"
                    rules={{
                      validate: (value) =>
                        validateInputs(value, "phone") ||
                        "Please enter a valid phone number",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        errorMessage={errors.phoneNumber?.message}
                        placeholder="Enter phone number"
                        label="Phone number"
                        autoComplete="tel"
                        type="tel"
                        required
                      />
                    )}
                  />
                </fieldset>
              )}
              <Button
                type="submit"
                className="w-full"
                isLoading={
                  method === "email"
                    ? forgotPasswordIsLoading
                    : sendPhoneResetOtpIsLoading
                }
                primary
              >
                Send reset {method === "email" ? "link" : "code"}
              </Button>
              <p
                className="text-sm"
                style={{ color: publicColors.neutralLight }}
              >
                Remember your password?{" "}
                <Link
                  to="/auth/login"
                  className="text-primary hover:underline transition-colors duration-200 ease-in-out text-[11px] lg:text-[12px]"
                >
                  Back to login
                </Link>
              </p>
            </form>
          </section>
        </div>
      </PublicLayout>
    </>
  );
};

export default ForgotPassword;
