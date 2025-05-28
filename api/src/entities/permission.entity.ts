import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './index';
import { PermissionNames } from '../constants/permission.constants';
import { RolePermission } from './rolePermission.entity';

@Entity('permissions')
export class Permission extends AbstractEntity {
  // NAME
  @Column({ type: 'enum', enum: PermissionNames, nullable: false })
  name: PermissionNames;

  // DESCRIPTION
  @Column({ type: 'varchar', nullable: true })
  description: string;

  // ROLE PERMISSIONS
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[];
}
