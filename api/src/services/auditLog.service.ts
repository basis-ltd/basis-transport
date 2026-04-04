import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AuditLog, AuditAction } from '../entities/auditLog.entity';
import { UUID } from '../types';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { serializeEntityForAudit } from '../helpers/auditSerialize.helper';

/**
 * AUDIT LOG SERVICE (entity-level diffs). Shared singleton for decorators / direct use.
 */
export class AuditLogService {
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  private async findPage(
    options: {
      page: number;
      size: number;
      condition: FindOptionsWhere<AuditLog> | FindOptionsWhere<AuditLog>[];
      order: FindManyOptions<AuditLog>['order'];
    }
  ): Promise<Pagination<AuditLog>> {
    const { skip, take } = getPagination({
      page: options.page,
      size: options.size,
    });

    const auditLogs = await this.auditLogRepository.findAndCount({
      where: options.condition,
      skip,
      take,
      relations: {
        createdBy: true,
      },
      order: options.order,
    });

    return getPagingData({
      data: auditLogs,
      page: options.page,
      size: options.size,
    });
  }

  /**
   * CREATE AUDIT LOG
   */
  async createAuditLog(
    action: AuditAction,
    entityType: string,
    entityId: UUID,
    oldValues: unknown,
    newValues: unknown,
    createdById?: UUID
  ): Promise<AuditLog> {
    const auditLog = new AuditLog();
    auditLog.action = action;
    auditLog.entityType = entityType;
    auditLog.entityId = entityId;
    auditLog.oldValues = serializeEntityForAudit(oldValues);
    auditLog.newValues = serializeEntityForAudit(newValues);
    auditLog.createdById = createdById;

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * LOG CREATE
   */
  async logCreate(
    entityType: string,
    entityId: UUID,
    newValues: unknown,
    createdById?: UUID
  ): Promise<AuditLog> {
    return this.createAuditLog(
      AuditAction.CREATE,
      entityType,
      entityId,
      {},
      newValues,
      createdById
    );
  }

  /**
   * LOG UPDATE
   */
  async logUpdate(
    entityType: string,
    entityId: UUID,
    oldValues: unknown,
    newValues: unknown,
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
    oldValues: unknown,
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
    return this.findPage({
      page,
      size,
      condition,
      order: { updatedAt: 'DESC' },
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
    return this.findPage({
      page,
      size,
      condition,
      order: { createdAt: 'DESC' },
    });
  }
}

export const auditLogServiceSingleton = new AuditLogService();
