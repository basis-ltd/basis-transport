import { UUID } from '../../types';

/** Set by JwtAuthGuard after loading the user from the database (JWT carries `id` only). */
export interface AuthenticatedUser {
  id: UUID;
  email?: string;
  phoneNumber?: string;
  mustCompleteRegistration?: boolean;
  roleNames: string[];
}
