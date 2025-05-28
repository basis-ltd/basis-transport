import { AbstractEntity, UUID } from '.';
import { User } from './user.type';

export interface TransportCard extends AbstractEntity {
  name?: string;
  cardNumber?: string;
  createdById: UUID;
  createdBy?: User;
}
