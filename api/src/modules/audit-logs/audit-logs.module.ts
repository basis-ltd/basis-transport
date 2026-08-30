import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/auditLog.entity';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogService } from './audit-logs.service';
import { TransportCardsModule } from '../transport-cards/transport-cards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    forwardRef(() => TransportCardsModule),
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogsModule {}
