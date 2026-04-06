import { AbstractEntity, UUID } from '.';
import { User } from './user.type';
import { TransportCardProvider } from '@/constants/transportCard.constants';

export interface TransportCard extends AbstractEntity {
  name?: string;
  cardNumber?: string;
  provider?: TransportCardProvider;
  createdById: UUID;
  createdBy?: User;
}
