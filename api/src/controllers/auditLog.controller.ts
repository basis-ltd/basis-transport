import { Request, Response, NextFunction } from 'express';
import { auditLogServiceSingleton } from '../services/auditLog.service';
import { UUID } from '../types';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { AuditAction, AuditLog } from '../entities/auditLog.entity';
import { AuthenticatedRequest } from '../types/auth.types';
import { isOwnerOrAdmin } from '../helpers/auth.helper';
import { ForbiddenError } from '../helpers/errors.helper';
import { TransportCardService } from '../services/transportCard.service';

const auditLogService = auditLogServiceSingleton;
const transportCardService = new TransportCardService();

function buildUpdatedAtDateCondition(
  startDate: string | undefined,
  endDate: string | undefined
): Pick<FindOptionsWhere<AuditLog>, 'updatedAt'> {
  if (startDate && endDate) {
    return {
      updatedAt: Between(
        new Date(startDate),
        new Date(endDate)
      ),
    };
  }
  if (startDate) {
    return { updatedAt: MoreThanOrEqual(new Date(startDate)) };
  }
  if (endDate) {
    return { updatedAt: LessThanOrEqual(new Date(endDate)) };
  }
  return {};
}

export class AuditController {
  /**
   * FETCH AUDIT LOGS
   */
  fetchAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 0,
        size = 10,
        entityType,
        entityId,
        action,
        createdById,
        startDate,
        endDate,
      } = req.query;
      const condition:
        | FindOptionsWhere<AuditLog>
        | FindOptionsWhere<AuditLog>[] = {};

      if (entityType) {
        condition.entityType = entityType as string;
      }
      if (entityId) {
        condition.entityId = entityId as UUID;
      }
      if (action) {
        condition.action = action as AuditAction;
      }
      if (createdById) {
        condition.createdById = createdById as UUID;
      }

      Object.assign(
        condition,
        buildUpdatedAtDateCondition(
          startDate as string | undefined,
          endDate as string | undefined
        )
      );

      const result = await auditLogService.fetchAuditLogs({
        page: Number(page),
        size: Number(size),
        condition,
      });

      return res.status(200).json({
        message: 'Audit logs retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * FETCH ENTITY HISTORY
   */
  fetchEntityHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { entityType, entityId } = req.params;
      const { user } = req as AuthenticatedRequest;
      const {
        page = 0,
        size = 10,
        action,
        createdById,
        startDate,
        endDate,
      } = req.query;

      if (entityType === 'TransportCard') {
        const card = await transportCardService.getTransportCardById(
          entityId as UUID
        );
        if (!isOwnerOrAdmin(user, card.createdById as UUID)) {
          throw new ForbiddenError(
            'You cannot view audit history for this transport card'
          );
        }
      }

      const condition:
        | FindOptionsWhere<AuditLog>
        | FindOptionsWhere<AuditLog>[] = {};

      if (entityType) {
        condition.entityType = entityType as string;
      }
      if (entityId) {
        condition.entityId = entityId as UUID;
      }
      if (action) {
        condition.action = action as AuditAction;
      }
      if (createdById) {
        condition.createdById = createdById as UUID;
      }

      Object.assign(
        condition,
        buildUpdatedAtDateCondition(
          startDate as string | undefined,
          endDate as string | undefined
        )
      );

      const auditLogs = await auditLogService.fetchEntityHistory({
        page: Number(page),
        size: Number(size),
        condition,
      });

      return res.status(200).json({
        message: 'Entity history retrieved successfully',
        data: auditLogs,
      });
    } catch (error) {
      next(error);
    }
  };
}
