import { Gender } from '@/constants/user.constants';
import { UserStatus } from '@/constants/user.constants';
import { UUID } from '.';
import { AbstractEntity } from '.';
import { Role } from './role.type';
import { TransportCard } from './transportCart.type';

export interface User extends AbstractEntity {
  name?: string;
  email?: string;
  phoneNumber?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  status: UserStatus;
  nationality?: string;
  passwordHash?: string;
  userRoles?: UserRole[];
  transportCards?: TransportCard[];
}

export interface UserRole extends AbstractEntity {
  userId: UUID;
  roleId: UUID;
  user?: User;
  role?: Role;
}
