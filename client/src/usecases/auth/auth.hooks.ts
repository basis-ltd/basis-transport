import { useLoginMutation } from '@/api/mutations/apiSlice';
import { useAppDispatch } from '@/states/hooks';
import { setToken, setUser } from '@/states/slices/authSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
