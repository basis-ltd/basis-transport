import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportCard } from '../../entities/transportCard.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { TransportCardsController } from './transport-cards.controller';
import { TransportCardService } from './transport-cards.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransportCard]),
    forwardRef(() => AuditLogsModule),
  ],
  controllers: [TransportCardsController],
  providers: [TransportCardService],
  exports: [TransportCardService],
})
export class TransportCardsModule {}
