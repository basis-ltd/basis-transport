import { NextFunction, Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { UUID } from '../types';
import { UserStatus } from '../constants/user.constants';

// INITIALIZE SERVICES
const dashboardService = new DashboardService();

export class DashboardController {
  /**
   * COUNT TOTAL TRIPS
   */
  async countTotalUserTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, userId } = req.query;

      const totalTrips = await dashboardService.countTotalUserTrips({
        userId: userId as UUID,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      return res.status(200).json({
        message: 'Total trips counted successfully',
        data: totalTrips,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * COUNT TOTAL TRANSPORT CARDS
   */
  async countTotalTransportCards(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { startTime, endTime, createdById } = req.query;

      const totalCards = await dashboardService.countTotalTransportCards({
        createdById: createdById as UUID,
        startTime: startTime ? new Date(startTime as string) : undefined,
        endTime: endTime ? new Date(endTime as string) : undefined,
      });

      return res.status(200).json({
        message: 'Total transport cards counted successfully',
        data: totalCards,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * COUNT TOTAL USERS
   */
  async countTotalUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;

      const totalUsers = await dashboardService.countTotalUsers({
        status: status as UserStatus,
      });

      return res.status(200).json({
        message: 'Total users counted successfully',
        data: totalUsers,
      });
    } catch (error) {
      next(error);
    }
  }
}
