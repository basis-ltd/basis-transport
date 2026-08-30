import { AsyncLocalStorage } from 'async_hooks';
import { UUID } from '../../types';

export interface AuditRequestContext {
  requestId: string;
  /** Set by auth guard after the user is resolved from JWT + DB. */
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
