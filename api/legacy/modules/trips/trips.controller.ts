import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { TripService } from './trips.service';
import { UserTripService } from '../user-trips/user-trips.service';
import {
  CreateTripDto,
  QuickJoinTripDto,
  RecordEntranceDto,
  UpdateTripDto,
} from './dto/trip.dto';
import {
  CurrentUser,
  OptionalAuth,
  Public,
  Roles,
} from '../../common/decorators/auth.decorators';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { UUID } from '../../types';
import { Trip } from '../../entities/trip.entity';
import { UserTrip } from '../../entities/userTrip.entity';
import { TripStatus } from '../../constants/trip.constants';
import { ValidationError } from '../../helpers/errors.helper';
import { RoleTypes } from '../../constants/role.constants';
import { isAdminLike } from '../../helpers/auth.helper';

const tripOperatorRoles = [
  RoleTypes.DRIVER,
  RoleTypes.ADMIN,
  RoleTypes.SUPER_ADMIN,
];

@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripService: TripService,
    private readonly userTripService: UserTripService
  ) {}

  @OptionalAuth()
  @Get('nearby')
  async fetchNearbyTrips(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('limit') limit = '5'
  ) {
    const parsedLat = lat !== undefined ? Number(lat) : undefined;
    const parsedLng = lng !== undefined ? Number(lng) : undefined;
    const parsedLimit = Number(limit);

    if (
      (lat !== undefined || lng !== undefined) &&
      (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng))
    ) {
      throw new ValidationError('lat and lng must be valid numbers');
    }

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      throw new ValidationError('limit must be a positive number');
    }

    const nearbyTrips = await this.tripService.fetchNearbyTrips({
      lat: parsedLat,
      lng: parsedLng,
      limit: Math.min(parsedLimit, 5),
    });

    return {
      message: 'Nearby trips fetched successfully',
      data: nearbyTrips,
    };
  }

  @Public()
  @Post(':tripId/quick-join')
  @HttpCode(201)
  async quickJoinTrip(
    @Param('tripId') tripId: string,
    @Body() body: QuickJoinTripDto
  ) {
    const result = await this.tripService.quickJoinTrip({
      tripId: tripId as UUID,
      phoneNumber: body.phoneNumber as string,
      entranceLocation: body.entranceLocation as {
        type: string;
        coordinates: number[];
      },
    });

    return {
      message: 'Trip joined successfully',
      data: result,
    };
  }

  @Roles(...tripOperatorRoles)
  @Post()
  @HttpCode(201)
  async createTrip(
    @Body() body: CreateTripDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const newTrip = await this.tripService.createTrip({
      ...(body as Partial<Trip>),
      createdById: user.id,
    });
    return {
      message: 'Trip created successfully',
      data: newTrip,
    };
  }

  @Get()
  async fetchTrips(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('status') status?: TripStatus,
    @Query('locationFromId') locationFromId?: string,
    @Query('locationToId') locationToId?: string,
    @Query('createdById') createdById?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string
  ) {
    const condition: FindOptionsWhere<Trip> | FindOptionsWhere<Trip>[] = {};

    if (status) {
      condition.status = status;
    }
    if (locationFromId) {
      condition.locationFromId = locationFromId as UUID;
    }
    if (locationToId) {
      condition.locationToId = locationToId as UUID;
    }
    if (createdById) {
      condition.createdById = createdById as UUID;
    }
    if (startTime && endTime) {
      condition.startTime = Between(new Date(startTime), new Date(endTime));
    } else if (startTime) {
      condition.startTime = MoreThanOrEqual(new Date(startTime));
    } else if (endTime) {
      condition.endTime = LessThanOrEqual(new Date(endTime));
    }

    const trips = await this.tripService.fetchTrips({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Trips fetched successfully',
      data: trips,
    };
  }

  @Get('reference/:referenceId')
  async getTripByReferenceId(@Param('referenceId') referenceId: string) {
    const trip = await this.tripService.getTripByReferenceId(referenceId);
    return {
      message: 'Trip fetched successfully',
      data: trip,
    };
  }

  @Post(':tripId/entrance')
  @HttpCode(201)
  async recordEntranceForTrip(
    @Param('tripId') tripId: string,
    @Body() body: RecordEntranceDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const resolvedUserId =
      isAdminLike(user) && body.userId ? (body.userId as UUID) : user.id;

    const newUserTrip = await this.userTripService.createUserTrip({
      ...(body as Partial<UserTrip>),
      tripId: tripId as UUID,
      userId: resolvedUserId,
      createdById: user.id,
    });

    return {
      message: 'Entrance recorded successfully',
      data: newUserTrip,
    };
  }

  @Get(':id/capacity')
  async countAvailableCapacity(@Param('id') id: string) {
    const { availableCapacity, totalCapacity } =
      await this.tripService.countAvailableCapacity(id as UUID);

    return {
      message: 'Available capacity counted successfully',
      data: { availableCapacity, totalCapacity },
    };
  }

  @Roles(...tripOperatorRoles)
  @Patch(':id/start')
  async startTrip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const trip = await this.tripService.startTrip(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Trip started successfully',
      data: trip,
    };
  }

  @Roles(...tripOperatorRoles)
  @Patch(':id/complete')
  async completeTrip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const trip = await this.tripService.completeTrip(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Trip completed successfully',
      data: trip,
    };
  }

  @Roles(...tripOperatorRoles)
  @Patch(':id/cancel')
  async cancelTrip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const trip = await this.tripService.cancelTrip(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Trip cancelled successfully',
      data: trip,
    };
  }

  @Roles(...tripOperatorRoles)
  @Patch(':id')
  async updateTrip(
    @Param('id') id: string,
    @Body() body: UpdateTripDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const updatedTrip = await this.tripService.updateTrip(id as UUID, {
      ...(body as Partial<Trip>),
      createdById: user.id,
    });
    return {
      message: 'Trip updated successfully',
      data: updatedTrip,
    };
  }

  @Roles(...tripOperatorRoles)
  @Delete(':id')
  @HttpCode(204)
  async deleteTrip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.tripService.deleteTrip(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Trip deleted successfully',
    };
  }

  @Get(':id')
  async getTripById(@Param('id') id: string) {
    const trip = await this.tripService.getTripById(id as UUID);
    return {
      message: 'Trip fetched successfully',
      data: trip,
    };
  }
}
