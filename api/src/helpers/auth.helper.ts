import { RoleTypes } from '../constants/role.constants';
import { AuthenticatedUser } from '../types/auth.types';
import { UUID } from '../types';

export function hasAnyRole(
  user: AuthenticatedUser | undefined,
  ...roles: RoleTypes[]
): boolean {
  if (!user?.roleNames?.length) {
    return false;
  }
  return roles.some((r) => user.roleNames.includes(r));
}

export function isAdminLike(user: AuthenticatedUser | undefined): boolean {
  return hasAnyRole(user, RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN);
}

export function canManageUserTrip(
  user: AuthenticatedUser,
  userTripSubjectUserId: UUID
): boolean {
  return user.id === userTripSubjectUserId || isAdminLike(user);
}

export function isOwnerOrAdmin(
  user: AuthenticatedUser,
  ownerUserId: UUID
): boolean {
  return isAdminLike(user) || user.id === ownerUserId;
}
