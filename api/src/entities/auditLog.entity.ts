import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './index';
import { UUID } from '../types';
import { User } from './user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

@Entity('audit_logs')
export class AuditLog extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: AuditAction,
    name: 'action',
    nullable: false,
  })
  action: AuditAction;

  @Column({
    type: 'varchar',
    name: 'entity_type',
    nullable: false,
  })
  entityType: string;

  @Column({
    type: 'uuid',
    name: 'entity_id',
    nullable: false,
  })
  entityId: UUID;

  @Column({
    type: 'jsonb',
    name: 'old_values',
    nullable: true,
  })
  oldValues: Record<string, any>;

  @Column({
    type: 'jsonb',
    name: 'new_values',
    nullable: true,
  })
  newValues: Record<string, any>;

  @Column({
    type: 'uuid',
    name: 'created_by_id',
    nullable: true,
  })
  createdById?: UUID;

  // USER RELATION
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
