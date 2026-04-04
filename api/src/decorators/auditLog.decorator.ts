import { auditLogServiceSingleton } from '../services/auditLog.service';
import { UUID } from '../types';
import { getAuditContext } from '../middlewares/requestContext.middleware';

/**
 * Entity-level audit decorators (optional). Prefer {@link httpAuditMiddleware} for baseline
 * HTTP mutation logging; use these only when you need structured old/new snapshots per entity.
 */

interface AuditOptions {
  entityType: string;
  getUserId?: (args: any[]) => UUID | undefined;
  getEntityId: (args: any[]) => UUID;
  getEntity?: (args: any[]) => any;
}

/**
 * Creates an audit trail when a method updates an entity
 */
export function AuditUpdate(options: AuditOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const entityId = options.getEntityId(args);

        let userId = options.getUserId ? options.getUserId(args) : undefined;
        if (!userId) {
          userId = getAuditContext()?.userId;
        }

        let oldValues = {};
        try {
          const service = this as any;
          if (typeof service.getEntityById === 'function') {
            const entity = await service.getEntityById(entityId);
            if (entity) {
              oldValues = { ...entity };
            }
          }
        } catch (error) {
          console.error('Failed to get entity for audit log:', error);
        }

        const result = await originalMethod.apply(this, args);

        try {
          await auditLogServiceSingleton.logUpdate(
            options.entityType,
            entityId,
            oldValues,
            result || {},
            userId
          );
        } catch (error) {
          console.error('Error creating audit log (non-blocking):', error);
        }

        return result;
      } catch (error) {
        console.error(`Error in ${options.entityType} update:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Creates an audit trail when a method deletes an entity
 */
export function AuditDelete(options: AuditOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const entityId = options.getEntityId(args);

        let userId = options.getUserId ? options.getUserId(args) : undefined;
        if (!userId) {
          userId = getAuditContext()?.userId;
        }

        let oldValues = {};
        if (options.getEntity) {
          oldValues = { ...options.getEntity(args) };
        } else {
          try {
            const service = this as any;
            if (typeof service.getEntityById === 'function') {
              const entity = await service.getEntityById(entityId);
              if (entity) {
                oldValues = { ...entity };
              }
            }
          } catch (error) {
            console.error('Failed to get entity for audit log:', error);
          }
        }

        try {
          await auditLogServiceSingleton.logDelete(
            options.entityType,
            entityId,
            oldValues,
            userId
          );
        } catch (error) {
          console.error(
            'Error creating delete audit log (non-blocking):',
            error
          );
        }

        const result = await originalMethod.apply(this, args);

        return result;
      } catch (error) {
        console.error(`Error in ${options.entityType} delete:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}
