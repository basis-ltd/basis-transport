import { Permission } from './permission.type';
import { AbstractEntity } from './index';
import { UUID } from '.';
import { UserRole } from './user.type';
import { RoleStatus } from '@/constants/role.constants';

export interface Role extends AbstractEntity {
  name: string;
  description?: string;
  status: RoleStatus;
  userRoles?: UserRole[];
  rolePermissions?: RolePermission[];
}

export interface RolePermission extends AbstractEntity {
  roleId: UUID;
  permissionId: UUID;
  role?: Role;
  permission?: Permission;
}
