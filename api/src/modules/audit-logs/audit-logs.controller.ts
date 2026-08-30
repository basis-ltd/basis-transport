import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { AuditLogService } from './audit-logs.service';
import { UUID } from '../../types';
import { AuditAction, AuditLog } from '../../entities/auditLog.entity';
import { Roles } from '../../common/decorators/auth.decorators';
import { RoleTypes } from '../../constants/role.constants';

function buildUpdatedAtDateCondition(
  startDate: string | undefined,
  endDate: string | undefined
): Pick<FindOptionsWhere<AuditLog>, 'updatedAt'> {
  if (startDate && endDate) {
    return {
      updatedAt: Between(new Date(startDate), new Date(endDate)),
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

@Controller('audit-logs')
@Roles(RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN)
export class AuditLogsController {
  constructor(
    private readonly auditLogService: AuditLogService
  ) {}

  @Get()
  async fetchAuditLogs(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: AuditAction,
    @Query('createdById') createdById?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const condition: FindOptionsWhere<AuditLog> = {};

    if (entityType) {
      condition.entityType = entityType;
    }
    if (entityId) {
      condition.entityId = entityId as UUID;
    }
    if (action) {
      condition.action = action;
    }
    if (createdById) {
      condition.createdById = createdById as UUID;
    }

    Object.assign(condition, buildUpdatedAtDateCondition(startDate, endDate));

    const result = await this.auditLogService.fetchAuditLogs({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Audit logs retrieved successfully',
      data: result,
    };
  }

  @Get('entity/:entityType/:entityId')
  async fetchEntityHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('action') action?: AuditAction,
    @Query('createdById') createdById?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const condition: FindOptionsWhere<AuditLog> = {};

    if (entityType) {
      condition.entityType = entityType;
    }
    if (entityId) {
      condition.entityId = entityId as UUID;
    }
    if (action) {
      condition.action = action;
    }
    if (createdById) {
      condition.createdById = createdById as UUID;
    }

    Object.assign(condition, buildUpdatedAtDateCondition(startDate, endDate));

    const auditLogs = await this.auditLogService.fetchEntityHistory({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Entity history retrieved successfully',
      data: auditLogs,
    };
  }
}
