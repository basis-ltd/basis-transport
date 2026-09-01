import { useAppSelector } from "@/states/hooks";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AppLayout from "@/containers/navigation/AppLayout";
import { loginUrl } from "@/helpers/authRedirect.helper";

const AuthenticatedRoutes = () => {
  const { user, token, isHydrated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isHydrated) {
    return (
      <p className="p-6 text-sm font-normal" role="status">
        Loading account…
      </p>
    );
  }

  if (!user || !token) {
    return (
      <Navigate
        to={loginUrl(`${location.pathname}${location.search}`)}
        replace
      />
    );
  }

  if (user?.mustCompleteRegistration) {
    return <Navigate to="/auth/complete-registration" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default AuthenticatedRoutes;
