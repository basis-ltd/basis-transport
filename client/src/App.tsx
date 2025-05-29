import { useEffect } from 'react';
import { useAppDispatch } from '@/states/hooks';
import { setUser, setToken } from '@/states/slices/authSlice';
import { localStorageAdapter } from '@/adapters/storage/localStorage.adapter';
import { Toaster } from 'sonner';
import Router from './routes';

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function hydrateAuth() {
      const user = await localStorageAdapter.getItem('user');
      const token = await localStorageAdapter.getItem('token');
      if (user) dispatch(setUser(user));
      if (token) dispatch(setToken(token));
    }
    hydrateAuth();
  }, [dispatch]);

  return (
    <>
    <Toaster />
      <Router />
    </>
  );
};

export default App;
