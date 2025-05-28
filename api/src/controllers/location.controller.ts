import { NextFunction, Request, Response } from 'express';
import { LocationService } from '../services/location.service';
import { FindOptionsWhere, ILike } from 'typeorm';
import { Location } from '../entities/location.entity';
import { UUID } from '../types';
import { AuthenticatedRequest } from '../types/auth.types';

// INITIALIZE SERVICES
const locationService = new LocationService();

export class LocationController {
  /**
   * CREATE LOCATION
   */
  async createLocation(req: Request, res: Response, next: NextFunction) {
    try {

      // GET USER
      const { user } = req as AuthenticatedRequest;

      const location = await locationService.createLocation({
        ...req.body,
        createdById: user.id,
      });
      return res.status(201).json({
        message: 'Location created successfully',
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * FETCH LOCATIONS
   */
  async fetchLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 0, size = 10, name, description } = req.query;

      // BUILD CONDITION
      let condition: FindOptionsWhere<Location> | FindOptionsWhere<Location>[] =
        {};

      if (name) {
        condition = [
          {
            name: ILike(`%${name}%`),
          },
        ];
      }

      if (description) {
        condition = [
          {
            description: ILike(`%${description}%`),
          },
        ];
      }

      const locations = await locationService.fetchLocations({
        page: Number(page),
        size: Number(size),
        condition,
      });

      return res.status(200).json({
        message: 'Locations fetched successfully',
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET LOCATION BY ID
   */
  async getLocationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const location = await locationService.getLocationById(id as UUID);

      return res.status(200).json({
        message: 'Location fetched successfully',
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE LOCATION
   */
  async deleteLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { user } = req as AuthenticatedRequest;

      await locationService.deleteLocation(id as UUID, {
        createdById: user?.id,
      });

      return res.status(204).json({
        message: 'Location deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * UPDATE LOCATION
   */
  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const location = await locationService.updateLocation(
        id as UUID,
        req.body
      );

      return res.status(200).json({
        message: 'Location updated successfully',
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }
}
