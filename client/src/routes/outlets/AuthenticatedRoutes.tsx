import { useAppSelector } from "@/states/hooks";
import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedRoutes = () => {
  /**
   * STATE VARIABLES
   */
  const { user, token, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated) {
    return null;
  }

  if (!user || !token) {
    return <Navigate to="/auth/login" />;
  }

  return <Outlet />;
};

export default AuthenticatedRoutes;
