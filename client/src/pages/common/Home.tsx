import { useAppSelector } from '@/states/hooks';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Home = () => {
  /**
   * STATE VARIABLES
   */
  const { user, token, isHydrated } = useAppSelector((state) => state.auth);

  /**
   * EFFECTS
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user || !token) {
      window.location.href = '/';
    }
  }, [isHydrated, user, token]);

  return <Navigate to="/dashboard" />;
};

export default Home;
