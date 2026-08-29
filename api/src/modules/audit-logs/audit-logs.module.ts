import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/auditLog.entity';
import { TransportCard } from '../../entities/transportCard.entity';
import { AuditLogsController } from './audit-logs.controller';
import {
  AuditLogService,
  setAuditLogServiceInstance,
} from '../../services/auditLog.service';
import { TransportCardService } from '../../services/transportCard.service';
import { TransportCardsModule } from '../transport-cards/transport-cards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, TransportCard]),
    TransportCardsModule,
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogsModule implements OnModuleInit {
  constructor(private readonly auditLogService: AuditLogService) {}

  onModuleInit() {
    setAuditLogServiceInstance(this.auditLogService);
  }
}
