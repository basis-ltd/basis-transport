import {
  useCompleteRegistrationMutation,
  useLoginMutation,
  usePhoneLoginPrecheckMutation,
  useResetPasswordWithPhoneMutation,
  useSendPhoneResetOtpMutation,
  useSendPhoneOtpMutation,
  useVerifyPhoneResetOtpMutation,
  useVerifyPhoneOtpMutation,
  useForgotPasswordMutation,
} from '@/api/mutations/apiSlice';
import { useAppDispatch } from '@/states/hooks';
import { setLogout, setToken, setUser } from '@/states/slices/authSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSignupMutation } from '@/api/mutations/apiSlice';
import {
  clearPersistedAuthSession,
  persistAuthSession,
} from '@/states/authSession';
import { User } from '@/types/user.type';

const readApiErrorMessage = (error: unknown): string =>
  (
    error as {
      data?: {
        message?: string;
      };
    }
  )?.data?.message || 'Something went wrong';

const getAuthRedirectPath = (user?: User) => {
  if (user?.mustCompleteRegistration) {
    return '/auth/complete-registration';
  }

  return '/dashboard';
};

/**
 * LOGIN
 */
export const useLogin = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  //
  const navigate = useNavigate();

  // MUTATION
  const [
    login,
    {
      isLoading: loginIsLoading,
      isError: loginIsError,
      isSuccess: loginIsSuccess,
      error: loginError,
      data: loginData,
    },
  ] = useLoginMutation();

  useEffect(() => {
    if (loginIsSuccess) {
      toast.success('Login successful');
      const token = loginData?.data.token;
      const user = loginData?.data.user;
      void persistAuthSession({ user, token });
      dispatch(setToken(token));
      dispatch(setUser(user));
      navigate(getAuthRedirectPath(user));
    } else if (loginIsError) {
      toast.error(readApiErrorMessage(loginError));
    }
  }, [dispatch, loginData, loginIsSuccess, loginIsError, loginError, navigate]);

  return { login, loginIsLoading, loginIsError, loginIsSuccess, loginError };
};

/**
 * SIGNUP
 */
export const useSignup = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [
    signup,
    {
      isLoading: signupIsLoading,
      isError: signupIsError,
      isSuccess: signupIsSuccess,
      error: signupError,
      data: signupData,
    },
  ] = useSignupMutation();

  useEffect(() => {
    if (signupIsSuccess) {
      toast.success('Signup successful');
      const token = signupData?.data.token;
      const user = signupData?.data.user;
      void persistAuthSession({ user, token });
      dispatch(setToken(token));
      dispatch(setUser(user));
      navigate(getAuthRedirectPath(user));
    } else if (signupIsError) {
      toast.error(readApiErrorMessage(signupError));
    }
  }, [dispatch, signupData, signupIsSuccess, signupIsError, signupError, navigate]);

  return { signup, signupIsLoading, signupIsError, signupIsSuccess, signupError };
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return async () => {
    await clearPersistedAuthSession();
    dispatch(setLogout());
    navigate('/auth/login');
  };
};

/**
 * PHONE LOGIN PRECHECK
 */
export const usePhoneLoginPrecheck = () => {
  const [precheck, { isLoading: precheckIsLoading }] = usePhoneLoginPrecheckMutation();

  const runPrecheck = async ({ phoneNumber }: { phoneNumber: string }) => {
    const response = await precheck({ phoneNumber }).unwrap();
    return response?.data as { hasPassword: boolean };
  };

  return {
    runPrecheck,
    precheckIsLoading,
  };
};

/**
 * SEND PHONE OTP
 */
export const useSendPhoneOtp = () => {
  const [sendOtp, { isLoading: sendPhoneOtpIsLoading }] = useSendPhoneOtpMutation();

  const sendPhoneOtp = async ({ phoneNumber }: { phoneNumber: string }) => {
    const response = await sendOtp({ phoneNumber }).unwrap();
    return response?.data as { otpSent: boolean; cooldownSeconds: number };
  };

  return {
    sendPhoneOtp,
    sendPhoneOtpIsLoading,
  };
};

/**
 * VERIFY PHONE OTP
 */
export const useVerifyPhoneOtp = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [verifyOtp, { isLoading: verifyPhoneOtpIsLoading }] = useVerifyPhoneOtpMutation();

  const verifyPhoneOtp = async ({
    phoneNumber,
    otp,
  }: {
    phoneNumber: string;
    otp: string;
  }) => {
    const response = await verifyOtp({ phoneNumber, otp }).unwrap();
    const token = response?.data?.token;
    const user = response?.data?.user;

    await persistAuthSession({ user, token });
    dispatch(setToken(token));
    dispatch(setUser(user));
    navigate(getAuthRedirectPath(user));
  };

  return {
    verifyPhoneOtp,
    verifyPhoneOtpIsLoading,
  };
};

/**
 * SEND PHONE RESET OTP
 */
export const useSendPhoneResetOtp = () => {
  const [sendPhoneResetOtp, { isLoading, isSuccess, reset, data }] = useSendPhoneResetOtpMutation();

  return {
    sendPhoneResetOtp,
    isLoading,
    isSuccess,
    data,
    reset,
  };
};

export const useForgotPassword = () => {
  const [forgotPassword, { isLoading, isSuccess, reset, data }] = useForgotPasswordMutation();

  return {
    forgotPassword,
    isLoading,
    isSuccess,
    data,
    reset,
  };
};

/**
 * VERIFY PHONE RESET OTP
 */
export const useVerifyPhoneResetOtp = () => {
  const [verifyOtp, { isLoading: verifyPhoneResetOtpIsLoading }] = useVerifyPhoneResetOtpMutation();

  const verifyPhoneResetOtp = async ({
    phoneNumber,
    otp,
  }: {
    phoneNumber: string;
    otp: string;
  }) => {
    const response = await verifyOtp({ phoneNumber, otp }).unwrap();
    return response?.data as { resetToken: string; expiresInSeconds: number };
  };

  return {
    verifyPhoneResetOtp,
    verifyPhoneResetOtpIsLoading,
  };
};

/**
 * RESET PASSWORD WITH PHONE
 */
export const useResetPasswordWithPhone = () => {
  const [reset, { isLoading: resetPasswordWithPhoneIsLoading }] =
    useResetPasswordWithPhoneMutation();

  const resetPasswordWithPhone = async ({
    phoneNumber,
    resetToken,
    password,
  }: {
    phoneNumber: string;
    resetToken: string;
    password: string;
  }) => {
    const response = await reset({ phoneNumber, resetToken, password }).unwrap();
    return response as { message: string };
  };

  return {
    resetPasswordWithPhone,
    resetPasswordWithPhoneIsLoading,
  };
};

/**
 * COMPLETE REGISTRATION
 */
export const useCompleteRegistration = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [complete, { isLoading: completeRegistrationIsLoading }] =
    useCompleteRegistrationMutation();

  const completeRegistration = async ({
    email,
    password,
  }: {
    email?: string;
    password: string;
  }) => {
    const response = await complete({ email, password }).unwrap();
    const token = response?.data?.token;
    const user = response?.data?.user;

    await persistAuthSession({ user, token });
    dispatch(setToken(token));
    dispatch(setUser(user));
    navigate('/dashboard');
  };

  return {
    completeRegistration,
    completeRegistrationIsLoading,
  };
};
