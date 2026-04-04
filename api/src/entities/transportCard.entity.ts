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
}
