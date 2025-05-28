import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '.';
import { User } from './user.entity';
import { UUID } from '../types';

@Entity('transport_cards')
export class TransportCard extends AbstractEntity {
  // NAME
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string;

  // CARD NO
  @Column({
    name: 'card_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  cardNumber: string;

  // USER ID
  @Column({
    name: 'created_by_id',
    type: 'uuid',
    nullable: false,
  })
  createdById: UUID;

  /**
   * RELATIONS
   */

  // USER
  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
