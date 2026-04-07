import { Request } from 'express';
import { UUID } from './index';

/** Set by authMiddleware after loading the user from the database (JWT carries `id` only). */
export interface AuthenticatedUser {
  id: UUID;
  email?: string;
  phoneNumber?: string;
  mustCompleteRegistration?: boolean;
  roleNames: string[];
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
