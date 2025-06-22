import { useAppSelector } from '@/states/hooks';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Home = () => {
  /**
   * STATE VARIABLES
   */
  const { user, token } = useAppSelector((state) => state.auth);

  /**
   * EFFECTS
   */
  useEffect(() => {
    if (!user || !token) {
      window.location.href = '/';
    }
  }, [user, token]);

  return <Navigate to="/dashboard" />;
};

export default Home;
