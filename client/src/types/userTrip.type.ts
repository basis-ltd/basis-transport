import { Trip } from './trip.type';
import { AbstractEntity } from '.';
import { UUID } from '.';
import { User } from './user.type';
import { Geometry } from './common.type';
import { UserTripStatus } from '@/constants/userTrip.constants';

export interface UserTrip extends AbstractEntity {
  userId: UUID;
  tripId: UUID;
  status: UserTripStatus;
  entranceLocation: Geometry;
  exitLocation?: Geometry;
  startTime: string | Date;
  endTime?: string | Date;
  createdById: UUID;
  user?: User;
  trip?: Trip;
  createdBy?: User;
}
