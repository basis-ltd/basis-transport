import { AbstractEntity } from '.';

import { UUID } from '.';
import { User } from './user.type';

export interface Log extends AbstractEntity {
  message: string;
  userId?: UUID;
  type: string;
  referenceId?: string;
  referenceType?: string;
  user?: User;
}
