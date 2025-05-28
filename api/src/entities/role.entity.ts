import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './index';
import { UserRole } from './userRole.entity';
import { RoleStatus } from '../constants/role.constants';
import { RolePermission } from './rolePermission.entity';

@Entity('roles')
export class Role extends AbstractEntity {
  // NAME
  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  name: string;

  // DESCRIPTION
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    enum: RoleStatus,
    nullable: false,
    default: RoleStatus.ACTIVE,
  })
  status: RoleStatus;
  /**
   * RELATIONS
   */

  // USER ROLES
  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  // ROLE PERMISSIONS
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role,)
  rolePermissions: RolePermission[];
}
