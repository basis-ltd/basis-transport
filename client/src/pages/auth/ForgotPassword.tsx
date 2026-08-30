import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import TelInput from "@/components/inputs/TelInput";
import validateInputs, { normalizePhoneNumber } from "@/helpers/validations.helper";
import { validatePhoneNumber } from "@/utils/phone.util";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Seo } from "@/components/seo";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import {
  useForgotPassword,
  useSendPhoneResetOtp,
} from "@/usecases/auth/auth.hooks";
import {
  AuthPageShell,
  AuthTabs,
} from './AuthPageShell';

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
      const phoneNumber =
        normalizePhoneNumber(data.phoneNumber) ?? data.phoneNumber;
      sendPhoneResetOtp({ phoneNumber });
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
      const phoneNumber = normalizePhoneNumber(watch('phoneNumber')) ?? watch('phoneNumber');
      navigate(
        `/auth/reset-phone-otp?phone=${encodeURIComponent(phoneNumber)}`,
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
      <AuthPageShell>
          <section className="card-framed flex w-full flex-col gap-5 p-8 max-sm:p-5">
            <header className="flex flex-col gap-2 items-center mb-4">
              <h1 className="type-h3 text-center">Forgot password</h1>
              <p
                className="type-body-sm text-center text-(--muted)"
              >
                {method === "email"
                  ? "Enter your email and we'll send you a reset link if an account exists."
                  : "Enter your phone number and we'll send you a reset code if an account exists."}
              </p>
            </header>
            <AuthTabs
              label="Reset method"
              value={method}
              onChange={switchMethod}
              options={[
                { label: 'Email', value: 'email' },
                { label: 'Phone', value: 'phone' },
              ]}
            />
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
                      validate: (value) => validatePhoneNumber(value),
                    }}
                    render={({ field }) => (
                      <TelInput
                        {...field}
                        errorMessage={errors.phoneNumber?.message as string}
                        placeholder="7XX XXX XXX"
                        label="Phone number"
                        autoComplete="tel"
                        required
                      />
                    )}
                  />
                </fieldset>
              )}
              <Button
                type="submit"
                primary
                    className="w-full"
                isLoading={
                  method === "email"
                    ? forgotPasswordIsLoading
                    : sendPhoneResetOtpIsLoading
                }
              >
                Send reset {method === "email" ? "link" : "code"}
              </Button>
              <p
                className="type-body-sm text-(--muted)"
              >
                Remember your password?{" "}
                <Link
                  to="/auth/login"
                  className="text-(--ink) hover:underline transition-colors duration-200 ease-in-out type-body-sm"
                >
                  Back to login
                </Link>
              </p>
            </form>
          </section>
      </AuthPageShell>
    </>
  );
};

export default ForgotPassword;
