import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { UUID } from '../types';

export interface AuditRequestContext {
  requestId: string;
  /** Set by auth middleware after the user is resolved from JWT + DB. */
  userId?: UUID;
}

export const auditRequestContext = new AsyncLocalStorage<AuditRequestContext>();

export function getAuditContext(): AuditRequestContext | undefined {
  return auditRequestContext.getStore();
}

export function setAuditUserId(userId: UUID | undefined): void {
  const store = auditRequestContext.getStore();
  if (store) {
    store.userId = userId;
  }
}

const REQUEST_ID_HEADER = 'x-request-id';

function getOrCreateRequestId(req: Request): string {
  const h = req.headers[REQUEST_ID_HEADER];
  const fromHeader = Array.isArray(h) ? h[0] : h;
  if (typeof fromHeader === 'string' && fromHeader.trim()) {
    return fromHeader.trim().slice(0, 128);
  }
  return randomUUID();
}

/**
 * Establishes AsyncLocalStorage for the whole /api request tree.
 * Must be the first middleware on the API router.
 */
export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = getOrCreateRequestId(req);
  req.headers[REQUEST_ID_HEADER] = requestId;

  const store: AuditRequestContext = { requestId };
  auditRequestContext.run(store, () => {
    next();
  });
}
