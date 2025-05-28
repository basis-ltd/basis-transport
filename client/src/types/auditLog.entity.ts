import { AuditAction } from '@/constants/auditLog.constants';
import { UUID } from '.';

import { AbstractEntity } from '.';

import { User } from './user.type';

export interface AuditLog extends AbstractEntity {
  action: AuditAction;
  entityType: string;
  entityId: UUID;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValues?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValues?: Record<string, any>;
  createdById?: UUID;
  createdBy?: User;
}
