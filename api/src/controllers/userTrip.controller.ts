import { NextFunction, Request, Response } from 'express';
import { UserTripService } from '../services/userTrip.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { UUID } from '../types';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { UserTripStatus } from '../constants/userTrip.constants';
import { UserTrip } from '../entities/userTrip.entity';
import {
  canManageUserTrip,
  isAdminLike,
} from '../helpers/auth.helper';
import { ForbiddenError, ValidationError } from '../helpers/errors.helper';

const userTripService = new UserTripService();

function buildStartTimeEndTimeCondition(
  startTime: string | undefined,
  endTime: string | undefined
): Pick<FindOptionsWhere<UserTrip>, 'startTime' | 'endTime'> {
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return { startTime: Between(start, end) };
  }
  if (startTime) {
    return { startTime: MoreThanOrEqual(new Date(startTime)) };
  }
  if (endTime) {
    return { endTime: LessThanOrEqual(new Date(endTime)) };
  }
  return {};
}

export class UserTripController {
  /**
   * CREATE USER TRIP (entrance)
   */
  async createUserTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;

      const resolvedUserId =
        isAdminLike(user) && req.body.userId
          ? (req.body.userId as UUID)
          : user.id;

      const newUserTrip = await userTripService.createUserTrip({
        ...req.body,
        userId: resolvedUserId,
        createdById: user.id,
      });

      return res.status(201).json({
        message: 'User trip created successfully',
        data: newUserTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /user-trips/entrance — same semantics as POST / with explicit resource name
   */
  async recordEntranceFromBody(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;

      const resolvedUserId =
        isAdminLike(user) && req.body.userId
          ? (req.body.userId as UUID)
          : user.id;

      const newUserTrip = await userTripService.createUserTrip({
        ...req.body,
        userId: resolvedUserId,
        createdById: user.id,
      });

      return res.status(201).json({
        message: 'Entrance recorded successfully',
        data: newUserTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /trips/:tripId/entrance — entrance for the authenticated passenger
   */
  async recordEntranceForTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId } = req.params;
      const { user } = req as AuthenticatedRequest;

      const resolvedUserId =
        isAdminLike(user) && req.body.userId
          ? (req.body.userId as UUID)
          : user.id;

      const newUserTrip = await userTripService.createUserTrip({
        ...req.body,
        tripId: tripId as UUID,
        userId: resolvedUserId,
        createdById: user.id,
      });

      return res.status(201).json({
        message: 'Entrance recorded successfully',
        data: newUserTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /user-trips/:id/exit — record exit / completion for this boarding record
   */
  async recordExit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { user } = req as AuthenticatedRequest;

      if (!req.body?.exitLocation) {
        throw new ValidationError('exitLocation is required');
      }

      const existing = await userTripService.getUserTripById(id as UUID);
      if (!canManageUserTrip(user, existing.userId)) {
        throw new ForbiddenError('You cannot modify this user trip');
      }

      const updatedUserTrip = await userTripService.updateUserTrip(
        id as UUID,
        {
          status: UserTripStatus.COMPLETED,
          exitLocation: req.body.exitLocation,
          endTime: req.body.endTime
            ? new Date(req.body.endTime)
            : new Date(),
          createdById: user.id,
        }
      );

      return res.status(200).json({
        message: 'Exit recorded successfully',
        data: updatedUserTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * UPDATE USER TRIP
   */
  async updateUserTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { user } = req as AuthenticatedRequest;

      const existing = await userTripService.getUserTripById(id as UUID);
      if (!canManageUserTrip(user, existing.userId)) {
        throw new ForbiddenError('You cannot modify this user trip');
      }

      const updatedUserTrip = await userTripService.updateUserTrip(id as UUID, {
        ...req.body,
        createdById: user.id,
      });

      return res.status(200).json({
        message: 'User trip updated successfully',
        data: updatedUserTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE USER TRIP
   */
  async deleteUserTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { user } = req as AuthenticatedRequest;

      const existing = await userTripService.getUserTripById(id as UUID);
      if (!canManageUserTrip(user, existing.userId)) {
        throw new ForbiddenError('You cannot delete this user trip');
      }

      await userTripService.deleteUserTrip(id as UUID, {
        createdById: user?.id,
      });

      return res.status(204).json({
        message: 'User trip deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET USER TRIP BY ID
   */
  async getUserTripById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { user } = req as AuthenticatedRequest;

      const userTrip = await userTripService.getUserTripById(id as UUID);

      if (!canManageUserTrip(user, userTrip.userId)) {
        throw new ForbiddenError('You cannot view this user trip');
      }

      return res.status(200).json({
        message: 'User trip fetched successfully',
        data: userTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * FETCH USER TRIPS
   */
  async fetchUserTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 0,
        size = 10,
        status,
        userId,
        tripId,
        startTime,
        endTime,
      } = req.query;

      const { user } = req as AuthenticatedRequest;

      const condition: FindOptionsWhere<UserTrip> = {};

      if (status) {
        condition.status = status as UserTripStatus;
      }

      if (isAdminLike(user)) {
        if (userId) {
          condition.userId = userId as UUID;
        }
      } else {
        condition.userId = user.id;
      }

      if (tripId) {
        condition.tripId = tripId as UUID;
      }

      Object.assign(
        condition,
        buildStartTimeEndTimeCondition(
          startTime as string | undefined,
          endTime as string | undefined
        )
      );

      const userTrips = await userTripService.fetchUserTrips({
        page: Number(page as string),
        size: Number(size as string),
        condition,
      });

      return res.status(200).json({
        message: 'User trips fetched successfully',
        data: userTrips,
      });
    } catch (error) {
      next(error);
    }
  }
}
