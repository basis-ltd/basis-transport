import { UUID } from 'crypto';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: UUID;
    email: string;
    role: string;
  };
}
