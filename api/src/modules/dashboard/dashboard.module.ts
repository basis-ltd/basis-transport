import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Trip } from '../../entities/trip.entity';
import { TransportCard } from '../../entities/transportCard.entity';
import { UserTrip } from '../../entities/userTrip.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Trip, TransportCard, UserTrip])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
