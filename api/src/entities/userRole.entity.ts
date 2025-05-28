import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './index';
import { User } from './user.entity';
import { Role } from './role.entity';
import { UUID } from '../types';

@Entity('user_roles')
export class UserRole extends AbstractEntity {
  // USER ID
  @Column({ name: 'user_id', type: 'uuid' })
  userId: UUID;

  // ROLE ID
  @Column({ name: 'role_id', type: 'uuid' })
  roleId: UUID;

  /**
   * RELATIONS
   */

  // USER
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ROLE
  @ManyToOne(() => Role, (role) => role.id)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
