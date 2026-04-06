import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '.';
import { User } from './user.entity';
import { UUID } from '../types';
import { TransportCardProvider } from '../constants/transportCard.constants';

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
    nullable: false,
  })
  cardNumber: string;

  // PROVIDER
  @Column({
    name: 'provider',
    type: 'enum',
    nullable: false,
    enum: TransportCardProvider,
    default: TransportCardProvider.AC_GROUP,
  })
  provider: TransportCardProvider;
}
