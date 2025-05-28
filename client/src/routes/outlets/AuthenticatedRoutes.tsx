import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { setLogout } from '@/states/slices/authSlice';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const AuthenticatedRoutes = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  /**
   * EFFECTS
   */
  useEffect(() => {
    if (!user || !token) {
      dispatch(setLogout());
      window.location.href = '/auth/login';
    }
  }, [user, token, dispatch]);

  return <Outlet />;
};

export default AuthenticatedRoutes;
