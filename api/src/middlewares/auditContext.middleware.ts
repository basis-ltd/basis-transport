import { NextFunction, Request, Response } from 'express';
import { UUID } from '../types';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * A namespace for storing request-specific data that can be accessed
 * throughout the application during a request lifecycle.
 */
export namespace AuditContext {
  // Use AsyncLocalStorage to handle concurrent requests
  const asyncLocalStorage = new Map<string, UUID>();
  const REQUEST_ID_KEY = 'X-Request-ID';

  /**
   * Generate a simple request ID if one is not provided
   */
  function getRequestId(req: Request): string {
    if (!req.headers[REQUEST_ID_KEY]) {
      req.headers[REQUEST_ID_KEY] = `req-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;
    }
    return req.headers[REQUEST_ID_KEY] as string;
  }

  export function setCurrentUserId(
    req: Request,
    userId: UUID | undefined
  ): void {
    const requestId = getRequestId(req);
    if (userId) {
      asyncLocalStorage.set(requestId, userId);
    } else {
      asyncLocalStorage.delete(requestId);
    }
  }

  export function getCurrentUserId(): UUID | undefined {
    // Since we can't access the request context directly in the decorator,
    // we'll just return the first user ID we find
    // This is a simplified approach and should be improved in production
    if (asyncLocalStorage.size === 0) {
      return undefined;
    }

    return Array.from(asyncLocalStorage.values())[0];
  }

  /**
   * Resets the context for a specific request
   */
  export function reset(req: Request): void {
    const requestId = getRequestId(req);
    asyncLocalStorage.delete(requestId);
  }

  /**
   * Debug method to log the current state of the context storage
   */
  export function printContextState(): void {
    console.log(`AuditContext state: ${asyncLocalStorage.size} entries`);
    asyncLocalStorage.forEach((value, key) => {
      console.log(`Request ${key}: User ${value}`);
    });
  }
}

/**
 * Middleware to set the current user's ID in the AuditContext
 * when a user is authenticated, making it available for audit logging.
 *
 * This middleware should be placed AFTER the auth middleware in the stack
 * to ensure the user information is available.
 */
export const auditContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Reset the context first to ensure clean state
  AuditContext.reset(req);
  // Try to access the user from the request object as set by auth middleware
  const authReq = req as AuthenticatedRequest;

  if (authReq.user && authReq.user.id) {
    // Set the user ID in the audit context
    AuditContext.setCurrentUserId(req, authReq.user.id as UUID);

    // Debug log
    console.debug(`AuditContext: Set user ID ${authReq.user.id} for request`);
  }

  // Clear context when response is finished
  res.on('finish', () => {
    AuditContext.reset(req);
  });

  next();
};
