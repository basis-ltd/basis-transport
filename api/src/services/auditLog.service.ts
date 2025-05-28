import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AuditLog, AuditAction } from '../entities/auditLog.entity';
import { Between, FindOptionsWhere } from 'typeorm';
import { UUID } from '../types';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';

/**
 * AUDIT LOG SERVICE
 */
export class AuditLogService {
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * CREATE AUDIT LOG
   */
  async createAuditLog(
    action: AuditAction,
    entityType: string,
    entityId: UUID,
    oldValues: any,
    newValues: any,
    createdById?: UUID
  ): Promise<AuditLog> {
    const auditLog = new AuditLog();
    auditLog.action = action;
    auditLog.entityType = entityType;
    auditLog.entityId = entityId;
    auditLog.oldValues = oldValues;
    auditLog.newValues = newValues;
    auditLog.createdById = createdById;

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * LOG UPDATE
   */
  async logUpdate(
    entityType: string,
    entityId: UUID,
    oldValues: any,
    newValues: any,
    createdById?: UUID
  ): Promise<AuditLog> {
    return this.createAuditLog(
      AuditAction.UPDATE,
      entityType,
      entityId,
      oldValues,
      newValues,
      createdById
    );
  }

  /**
   * LOG DELETE
   */
  async logDelete(
    entityType: string,
    entityId: UUID,
    oldValues: any,
    createdById?: UUID
  ): Promise<AuditLog> {
    return this.createAuditLog(
      AuditAction.DELETE,
      entityType,
      entityId,
      oldValues,
      {},
      createdById
    );
  }

  /**
   * FIND AUDIT LOGS
   */
  async fetchAuditLogs({
    page = 0,
    size = 10,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<AuditLog> | FindOptionsWhere<AuditLog>[];
  }): Promise<Pagination<AuditLog>> {
    // GET PAGINATION
    const { skip, take } = getPagination({ page, size });

    const auditLogs = await this.auditLogRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        createdBy: true,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return getPagingData({
      data: auditLogs,
      page,
      size,
    });
  }

  /**
   * FETCH ENTITY HISTORY
   */
  async fetchEntityHistory({
    page = 0,
    size = 10,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<AuditLog> | FindOptionsWhere<AuditLog>[];
  }): Promise<Pagination<AuditLog>> {
    // GET PAGINATION
    const { skip, take } = getPagination({ page, size });

    const auditLogs = await this.auditLogRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        createdBy: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return getPagingData({
      data: auditLogs,
      page,
      size,
    });
  }
}
