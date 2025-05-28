import { Column, Entity, Geometry, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './index';
import { UUID } from '../types';
import { User } from './user.entity';

@Entity('locations')
export class Location extends AbstractEntity {
  // NAME
  @Column({ type: 'varchar', length: 255, nullable: false, name: 'name' })
  name: string;

  // DESCRIPTION
  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  // ADDRESS
  @Column({ type: 'geometry', nullable: true, name: 'address' })
  address?: Geometry;

  // CREATED BY ID
  @Column({ type: 'uuid', nullable: true, name: 'created_by_id' })
  createdById?: UUID;

  /**
   * RELATIONS
   */

  // CREATED BY
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;
}
