import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpAuditLog } from '../entities/httpAuditLog.entity';
import { UUID } from '../types';

export interface SaveHttpAuditInput {
  correlationId?: string;
  httpMethod: string;
  httpPath: string;
  httpStatus: number;
  durationMs: number;
  ip?: string;
  userAgent?: string;
  actorUserId?: UUID;
  bodySnapshot?: Record<string, unknown> | null;
}

@Injectable()
export class HttpAuditService {
  constructor(
    @InjectRepository(HttpAuditLog)
    private readonly repo: Repository<HttpAuditLog>
  ) {}

  async saveHttpAudit(input: SaveHttpAuditInput): Promise<HttpAuditLog> {
    const row = new HttpAuditLog();
    row.correlationId = input.correlationId;
    row.httpMethod = input.httpMethod;
    row.httpPath = input.httpPath;
    row.httpStatus = input.httpStatus;
    row.durationMs = input.durationMs;
    row.ip = input.ip;
    row.userAgent = input.userAgent;
    row.actorUserId = input.actorUserId;
    row.bodySnapshot = input.bodySnapshot ?? null;
    return this.repo.save(row);
  }
}
