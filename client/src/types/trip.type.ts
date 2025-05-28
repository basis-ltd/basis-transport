import { AbstractEntity } from '.';
import { Geometry } from './common.type';
import { Location } from './location.type';
import { User } from './user.type';

export enum TripStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Trip extends AbstractEntity {
  referenceId: string;
  startTime?: Date;
  endTime?: Date;
  locationFromId: string;
  locationToId?: string;
  createdById: string;
  status: TripStatus;
  totalCapacity?: number;
  currentLocation?: Geometry;

  // Relations
  locationFrom?: Location;
  locationTo?: Location;
  createdBy?: User;
}
