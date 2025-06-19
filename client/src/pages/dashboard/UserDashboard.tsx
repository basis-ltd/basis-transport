import AppLayout from '@/containers/navigation/AppLayout';
import { useAppSelector } from '@/states/hooks';

const UserDashboard = () => {

  /**
   * STATE VARIABLES
   */
  const { user } = useAppSelector((state) => state.auth);

  console.log(user);

  return (
    <AppLayout>
      <main className="h-full w-full flex items-center justify-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </main>
    </AppLayout>
  );
};

export default UserDashboard;
