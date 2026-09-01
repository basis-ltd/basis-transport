import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/states/hooks";
import AppLayout from "@/containers/navigation/AppLayout";
import { loginUrl } from "@/helpers/authRedirect.helper";

export default function StaffRoutes() {
  const { user, token, isHydrated } = useAppSelector((s) => s.auth);
  const location = useLocation();
  if (!isHydrated)
    return (
      <p className="p-6 text-[12px] font-light" role="status">
        Loading account…
      </p>
    );
  if (!user || !token)
    return (
      <Navigate
        to={loginUrl(`${location.pathname}${location.search}`)}
        replace
      />
    );
  const allowed = user.userRoles?.some((r) =>
    ["ADMIN", "SUPER_ADMIN"].includes(r.role?.name || ""),
  );
  if (!allowed) return <Navigate to="/saved" replace />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
