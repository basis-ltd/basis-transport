import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './index';
import { UUID } from '../types';
import { User } from './user.entity';
import { LogReferenceTypes, LogTypes } from '../constants/logs.constants';

@Entity('logs')
export class Log extends AbstractEntity {
  // MESSAGE
  @Column({
    type: 'text',
    name: 'message',
    nullable: false,
  })
  message: string;

  // USER ID
  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: true,
  })
  userId?: UUID;

  // TYPE
  @Column({
    type: 'enum',
    enum: LogTypes,
    name: 'type',
    nullable: false,
  })
  type: LogTypes;

  // REFERENCE ID
  @Column({
    type: 'varchar',
    name: 'reference_id',
    nullable: true,
  })
  referenceId?: string;

  // REFERENCE TYPE
  @Column({
    type: 'enum',
    enum: LogReferenceTypes,
    name: 'reference_type',
    nullable: true,
  })
  referenceType?: LogReferenceTypes;

  /**
   * RELATIONS
   */

  // USER
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
