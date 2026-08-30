import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/states/hooks';
export default function StaffRoutes(){
  const {user,token,isHydrated}=useAppSelector(s=>s.auth);
  if(!isHydrated)return <p className="p-6" role="status">Loading account…</p>;
  if(!user||!token)return <Navigate to="/auth/login" replace/>;
  const allowed=user.userRoles?.some(r=>['ADMIN','SUPER_ADMIN'].includes(r.role?.name||''));
  return allowed?<Outlet/>:<Navigate to="/saved" replace/>;
}
