import { useLoginMutation } from '@/api/mutations/apiSlice';
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
      navigate('/dashboard');
    } else if (loginIsError) {
      toast.error(
        (
          loginError as {
            data: {
              message: string;
            };
          }
        )?.data?.message
      );
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
      navigate('/dashboard');
    } else if (signupIsError) {
      toast.error(
        (
          signupError as {
            data: {
              message: string;
            };
          }
        )?.data?.message
      );
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
