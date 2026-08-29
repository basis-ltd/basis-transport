import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from '../../entities/trip.entity';
import { Location } from '../../entities/location.entity';
import { User } from '../../entities/user.entity';
import { UserTrip } from '../../entities/userTrip.entity';
import { Role } from '../../entities/role.entity';
import { UserRole } from '../../entities/userRole.entity';
import { TripsController } from './trips.controller';
import { TripService } from '../../services/trip.service';
import { UserTripService } from '../../services/userTrip.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trip,
      Location,
      User,
      UserTrip,
      Role,
      UserRole,
    ]),
  ],
  controllers: [TripsController],
  providers: [TripService, UserTripService],
})
export class TripsModule {}
