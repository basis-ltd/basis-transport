import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLog.service';
import { UUID } from '../types';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditAction, AuditLog } from '../entities/auditLog.entity';

export class AuditController {
  private auditLogService: AuditLogService;

  constructor() {
    this.auditLogService = new AuditLogService();
  }

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
      // BUILD CONDITION
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
      if (startDate) {
        condition.updatedAt = MoreThanOrEqual(new Date(startDate as string));
      }
      if (endDate) {
        condition.updatedAt = LessThanOrEqual(new Date(endDate as string));
      }
      if (startDate && endDate) {
        condition.createdAt = Between(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      }

      const result = await this.auditLogService.fetchAuditLogs({
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
      const { page = 0, size = 10, action, createdById, startDate, endDate } = req.query;

      // BUILD CONDITION
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

      if (startDate) {
        condition.updatedAt = MoreThanOrEqual(new Date(startDate as string));
      }
      if (endDate) {
        condition.updatedAt = LessThanOrEqual(new Date(endDate as string));
      }

      if (startDate && endDate) {
        condition.updatedAt = Between(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      }

      const auditLogs = await this.auditLogService.fetchEntityHistory({
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
