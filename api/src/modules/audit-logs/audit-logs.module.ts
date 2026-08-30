import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/auditLog.entity';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogService } from './audit-logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogsModule {}
