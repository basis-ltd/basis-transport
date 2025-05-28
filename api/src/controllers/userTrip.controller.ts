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

// LOAD USER TRIP SERVICE
const userTripService = new UserTripService();

export class UserTripController {
  /**
   * CREATE USER TRIP
   */
  async createUserTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;

      const newUserTrip = await userTripService.createUserTrip({
        ...req.body,
        createdById: user?.id,
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
   * UPDATE USER TRIP
   */
  async updateUserTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { user } = req as AuthenticatedRequest;

      const updatedUserTrip = await userTripService.updateUserTrip(id as UUID, {
        ...req.body,
        createdById: user?.id,
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

      // LOAD USER
      const { user } = req as AuthenticatedRequest;

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

      const userTrip = await userTripService.getUserTripById(id as UUID);

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

      /**
       * INITIALIZE CONDITION
       */
      let condition: FindOptionsWhere<UserTrip> | FindOptionsWhere<UserTrip>[] =
        {};

      if (status) {
        condition.status = status as UserTripStatus;
      }

      if (userId) {
        condition.userId = userId as UUID;
      }

      if (tripId) {
        condition.tripId = tripId as UUID;
      }

      if (startTime) {
        condition.startTime = MoreThanOrEqual(new Date(startTime as string));
      }

      if (endTime) {
        condition.endTime = LessThanOrEqual(new Date(endTime as string));
      }

      if (startTime && endTime) {
        condition.startTime = Between(
          new Date(startTime as string),
          new Date(endTime as string)
        );
      }

      const userTrips = await userTripService.fetchUserTrips({
        page: Number(page as string),
        size: Number(size as string),
        condition: condition as FindOptionsWhere<UserTrip>,
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
