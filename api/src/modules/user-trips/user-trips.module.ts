import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTrip } from '../../entities/userTrip.entity';
import { User } from '../../entities/user.entity';
import { Trip } from '../../entities/trip.entity';
import { UserTripsController } from './user-trips.controller';
import { UserTripService } from '../../services/userTrip.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTrip, User, Trip])],
  controllers: [UserTripsController],
  providers: [UserTripService],
  exports: [UserTripService],
})
export class UserTripsModule {}
