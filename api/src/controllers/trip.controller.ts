import { NextFunction, Request, Response } from 'express';
import { TripService } from '../services/trip.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { UUID } from '../types';
import { Trip } from '../entities/trip.entity';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { TripStatus } from '../constants/trip.constants';

// INITIALIZE SERVICES
const tripService = new TripService();

export class TripController {
  /**
   * CREATE TRIP
   */
  async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      // LOAD USER
      const { user } = req as AuthenticatedRequest;

      const newTrip = await tripService.createTrip({
        ...req.body,
        createdById: user?.id,
      });
      return res.status(201).json({
        message: 'Trip created successfully',
        data: newTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * UPDATE TRIP
   */
  async updateTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // LOAD USER
      const { user } = req as AuthenticatedRequest;

      const updatedTrip = await tripService.updateTrip(id as UUID, {
        ...req.body,
        createdById: user?.id,
      });

      return res.status(200).json({
        message: 'Trip updated successfully',
        data: updatedTrip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE TRIP
   */
  async deleteTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // LOAD USER
      const { user } = req as AuthenticatedRequest;

      await tripService.deleteTrip(id as UUID, {
        createdById: user.id,
      });

      return res.status(204).json({
        message: 'Trip deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * FETCH TRIPS
   */
  async fetchTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 0,
        size = 10,
        status,
        locationFromId,
        locationToId,
        createdById,
        startTime,
        endTime,
      } = req.query;

      // INITIALIZE CONDITION
      const condition: FindOptionsWhere<Trip> | FindOptionsWhere<Trip>[] = {};

      if (status) {
        condition.status = status as TripStatus;
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

      const trips = await tripService.fetchTrips({
        page: Number(page),
        size: Number(size),
        condition,
      });

      return res.status(200).json({
        message: 'Trips fetched successfully',
        data: trips,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET TRIP BY ID
   */
  async getTripById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const trip = await tripService.getTripById(id as UUID);

      return res.status(200).json({
        message: 'Trip fetched successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET TRIP BY REFERENCE ID
   */
  async getTripByReferenceId(req: Request, res: Response, next: NextFunction) {
    try {
      const { referenceId } = req.params;

      const trip = await tripService.getTripByReferenceId(referenceId);

      return res.status(200).json({
        message: 'Trip fetched successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * COUNT AVAILABLE CAPACITY
   */
  async countAvailableCapacity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const { availableCapacity, totalCapacity } =
        await tripService.countAvailableCapacity(id as UUID);

      return res.status(200).json({
        message: 'Available capacity counted successfully',
        data: {
          availableCapacity,
          totalCapacity,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * START TRIP
   */
  async startTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { user } = req as AuthenticatedRequest;

      const trip = await tripService.startTrip(id as UUID, {
        createdById: user?.id,
      });

      return res.status(200).json({
        message: 'Trip started successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * COMPLETE TRIP
   */
  async completeTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { user } = req as AuthenticatedRequest;

      const trip = await tripService.completeTrip(id as UUID, {
        createdById: user?.id,
      });

      return res.status(200).json({
        message: 'Trip completed successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * CANCEL TRIP
   */
  async cancelTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { user } = req as AuthenticatedRequest;

      const trip = await tripService.cancelTrip(id as UUID, {
        createdById: user?.id,
      });

      return res.status(200).json({
        message: 'Trip cancelled successfully',
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  }
}
