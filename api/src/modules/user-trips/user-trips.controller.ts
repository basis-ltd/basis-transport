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
import { UserTripService } from '../../services/userTrip.service';
import { CurrentUser } from '../../common/decorators/auth.decorators';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { UUID } from '../../types';
import { UserTrip } from '../../entities/userTrip.entity';
import { UserTripStatus } from '../../constants/userTrip.constants';
import {
  canManageUserTrip,
  isAdminLike,
} from '../../helpers/auth.helper';
import { ForbiddenError, ValidationError } from '../../helpers/errors.helper';

function buildStartTimeEndTimeCondition(
  startTime: string | undefined,
  endTime: string | undefined
): Pick<FindOptionsWhere<UserTrip>, 'startTime' | 'endTime'> {
  if (startTime && endTime) {
    return { startTime: Between(new Date(startTime), new Date(endTime)) };
  }
  if (startTime) {
    return { startTime: MoreThanOrEqual(new Date(startTime)) };
  }
  if (endTime) {
    return { endTime: LessThanOrEqual(new Date(endTime)) };
  }
  return {};
}

@Controller('user-trips')
export class UserTripsController {
  constructor(private readonly userTripService: UserTripService) {}

  @Post('entrance')
  @HttpCode(201)
  async recordEntranceFromBody(
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const resolvedUserId =
      isAdminLike(user) && body.userId
        ? (body.userId as UUID)
        : user.id;

    const newUserTrip = await this.userTripService.createUserTrip({
      ...body,
      userId: resolvedUserId,
      createdById: user.id,
    });

    return {
      message: 'Entrance recorded successfully',
      data: newUserTrip,
    };
  }

  @Post()
  @HttpCode(201)
  async createUserTrip(
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const resolvedUserId =
      isAdminLike(user) && body.userId
        ? (body.userId as UUID)
        : user.id;

    const newUserTrip = await this.userTripService.createUserTrip({
      ...body,
      userId: resolvedUserId,
      createdById: user.id,
    });

    return {
      message: 'User trip created successfully',
      data: newUserTrip,
    };
  }

  @Post(':id/exit')
  async recordExit(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!body?.exitLocation) {
      throw new ValidationError('exitLocation is required');
    }

    const existing = await this.userTripService.getUserTripById(id as UUID);
    if (!canManageUserTrip(user, existing.userId)) {
      throw new ForbiddenError('You cannot modify this user trip');
    }

    const updatedUserTrip = await this.userTripService.updateUserTrip(
      id as UUID,
      {
        status: UserTripStatus.COMPLETED,
        exitLocation: body.exitLocation as UserTrip['exitLocation'],
        endTime: body.endTime ? new Date(body.endTime as string) : new Date(),
        createdById: user.id,
      }
    );

    return {
      message: 'Exit recorded successfully',
      data: updatedUserTrip,
    };
  }

  @Patch(':id')
  async updateUserTrip(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const existing = await this.userTripService.getUserTripById(id as UUID);
    if (!canManageUserTrip(user, existing.userId)) {
      throw new ForbiddenError('You cannot modify this user trip');
    }

    const updatedUserTrip = await this.userTripService.updateUserTrip(
      id as UUID,
      {
        ...body,
        createdById: user.id,
      }
    );

    return {
      message: 'User trip updated successfully',
      data: updatedUserTrip,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUserTrip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const existing = await this.userTripService.getUserTripById(id as UUID);
    if (!canManageUserTrip(user, existing.userId)) {
      throw new ForbiddenError('You cannot delete this user trip');
    }

    await this.userTripService.deleteUserTrip(id as UUID, {
      createdById: user.id,
    });

    return {
      message: 'User trip deleted successfully',
    };
  }

  @Get()
  async fetchUserTrips(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('status') status?: UserTripStatus,
    @Query('userId') userId?: string,
    @Query('tripId') tripId?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @CurrentUser() user?: AuthenticatedUser
  ) {
    const condition: FindOptionsWhere<UserTrip> = {};

    if (status) {
      condition.status = status;
    }

    if (user && isAdminLike(user)) {
      if (userId) {
        condition.userId = userId as UUID;
      }
    } else if (user) {
      condition.userId = user.id;
    }

    if (tripId) {
      condition.tripId = tripId as UUID;
    }

    Object.assign(
      condition,
      buildStartTimeEndTimeCondition(startTime, endTime)
    );

    const userTrips = await this.userTripService.fetchUserTrips({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'User trips fetched successfully',
      data: userTrips,
    };
  }

  @Get(':id')
  async getUserTripById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const userTrip = await this.userTripService.getUserTripById(id as UUID);

    if (!canManageUserTrip(user, userTrip.userId)) {
      throw new ForbiddenError('You cannot view this user trip');
    }

    return {
      message: 'User trip fetched successfully',
      data: userTrip,
    };
  }
}
