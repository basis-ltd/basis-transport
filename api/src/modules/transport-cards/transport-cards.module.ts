import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportCard } from '../../entities/transportCard.entity';
import { TransportCardsController } from './transport-cards.controller';
import { TransportCardService } from '../../services/transportCard.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransportCard])],
  controllers: [TransportCardsController],
  providers: [TransportCardService],
  exports: [TransportCardService],
})
export class TransportCardsModule {}
