import { AbstractEntity } from '.';
import { RolePermission } from './role.type';

export interface Permission extends AbstractEntity {
  name: string;
  description?: string;
  rolePermissions?: RolePermission[];
}
