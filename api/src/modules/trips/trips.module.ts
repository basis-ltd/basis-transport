import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from '../../entities/trip.entity';
import { Location } from '../../entities/location.entity';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { UserRole } from '../../entities/userRole.entity';
import { UserTrip } from '../../entities/userTrip.entity';
import { TripsController } from './trips.controller';
import { TripService } from './trips.service';
import { UserTripsModule } from '../user-trips/user-trips.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Location, User, UserTrip, Role, UserRole]),
    UserTripsModule,
  ],
  controllers: [TripsController],
  providers: [TripService],
})
export class TripsModule {}
