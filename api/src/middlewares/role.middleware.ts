import { NextFunction, Request, Response } from 'express';
import { RoleTypes } from '../constants/role.constants';
import { ForbiddenError } from '../helpers/errors.helper';
import { hasAnyRole } from '../helpers/auth.helper';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Requires authMiddleware to run first. At least one of the given roles must be present.
 */
export function requireRole(...allowed: RoleTypes[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    if (!hasAnyRole(user, ...allowed)) {
      return next(
        new ForbiddenError('Insufficient permissions to perform this action')
      );
    }
    next();
  };
}
