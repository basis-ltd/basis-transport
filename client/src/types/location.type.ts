import { UUID } from '.';
import { AbstractEntity } from '.';
import { User } from './user.type';
import { Geometry } from './common.type';

export interface Location extends AbstractEntity {
  name: string;
  description?: string;
  address?: Geometry;
  createdById?: UUID;
  createdBy?: User;
}
