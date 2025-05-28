import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from './role.entity';
import { AbstractEntity } from '.';
import { UUID } from '../types';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission extends AbstractEntity {
  // ROLE ID
  @Column({ type: 'uuid', name: 'role_id' })
  roleId: UUID;

  // PERMISSION ID
  @Column({ type: 'uuid', name: 'permission_id' })
  permissionId: UUID;

  // ROLE
  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  // PERMISSION
  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
