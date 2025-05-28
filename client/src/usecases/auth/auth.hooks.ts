import { useLoginMutation } from '@/api/mutations/apiSlice';
import { useAppDispatch } from '@/states/hooks';
import { setToken, setUser } from '@/states/slices/authSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSignupMutation } from '@/api/mutations/apiSlice';

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
      dispatch(setToken(loginData?.data.token));
      dispatch(setUser(loginData?.data.user));
      navigate('/');
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
      dispatch(setToken(signupData?.data.token));
      dispatch(setUser(signupData?.data.user));
      navigate('/');
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
