import { AuditLogService } from '../services/auditLog.service';
import { UUID } from '../types';
import { AuditContext } from '../middlewares/auditContext.middleware';

interface AuditOptions {
  entityType: string;
  getUserId?: (args: any[]) => UUID | undefined;
  getEntityId: (args: any[]) => UUID;
  getEntity?: (args: any[]) => any;
}

// Define an interface for services that have a getEntityById method
interface ServiceWithGetById {
  getEntityById: (id: UUID) => Promise<any>;
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
        // Initialize audit log service
        const auditLogService = new AuditLogService();
        const entityId = options.getEntityId(args);

        // Get userId from arguments or context
        let userId = options.getUserId ? options.getUserId(args) : undefined;
        if (!userId) {
          userId = AuditContext.getCurrentUserId();
        }

        // Get entity before update
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

        // Execute original method
        const result = await originalMethod.apply(this, args);

        // Create audit log after operation completes
        try {
          await auditLogService.logUpdate(
            options.entityType,
            entityId,
            oldValues,
            { ...(result || {}) },
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
        // Initialize audit log service
        const auditLogService = new AuditLogService();
        const entityId = options.getEntityId(args);

        // Get userId from arguments or context
        let userId = options.getUserId ? options.getUserId(args) : undefined;
        if (!userId) {
          userId = AuditContext.getCurrentUserId();
        }

        // Get entity before deletion
        let oldValues = {};
        if (options.getEntity) {
          oldValues = options.getEntity(args);
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

        // Create audit log before deletion
        try {
          await auditLogService.logDelete(
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

        // Execute original method
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
