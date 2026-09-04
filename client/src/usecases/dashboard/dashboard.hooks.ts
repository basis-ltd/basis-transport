import { useAppSelector } from '@/states/hooks';
import type { DashboardRole } from '@/types/dashboard.type';

const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN'];
const DRIVER_ROLE = 'DRIVER';

export const getRoleNames = (
  userRoles?: { role?: { name?: string } }[],
): string[] =>
  (userRoles ?? [])
    .map((r) => r.role?.name || '')
    .filter((name) => name.length > 0);

export const resolveDashboardRole = (roleNames: string[]): DashboardRole => {
  if (roleNames.some((name) => STAFF_ROLES.includes(name))) return 'overview';
  if (roleNames.includes(DRIVER_ROLE)) return 'driver';
  return 'commuter';
};

/**
 * Which dashboard surface the signed-in user should see.
 * Staff see the operations overview, drivers see assignments,
 * everyone else sees the commuter view.
 */
export const useDashboardRole = (): DashboardRole => {
  const user = useAppSelector((s) => s.auth.user);
  return resolveDashboardRole(getRoleNames(user?.userRoles));
};
