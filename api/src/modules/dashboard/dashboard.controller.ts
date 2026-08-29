import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Public } from '../../common/decorators/auth.decorators';
import { UUID } from '../../types';
import { UserStatus } from '../../constants/user.constants';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Public()
  @Get('public/landing-stats')
  async getPublicLandingStats() {
    const data = await this.dashboardService.getPublicLandingStats();
    return {
      message: 'Public landing stats retrieved successfully',
      data,
    };
  }

  @Get('user-trips/count')
  async countTotalUserTrips(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string
  ) {
    const totalTrips = await this.dashboardService.countTotalUserTrips({
      userId: userId as UUID,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return {
      message: 'Total trips counted successfully',
      data: totalTrips,
    };
  }

  @Get('transport-cards/count')
  async countTotalTransportCards(
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('createdById') createdById?: string
  ) {
    const totalCards = await this.dashboardService.countTotalTransportCards({
      createdById: createdById as UUID,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
    });

    return {
      message: 'Total transport cards counted successfully',
      data: totalCards,
    };
  }

  @Get('users/count')
  async countTotalUsers(@Query('status') status?: UserStatus) {
    const totalUsers = await this.dashboardService.countTotalUsers({
      status,
    });

    return {
      message: 'Total users counted successfully',
      data: totalUsers,
    };
  }

  @Get('user-trips/time-spent')
  async countTotalTimeSpentOnTrips(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const totalTimeSpent =
      await this.dashboardService.countTotalTimeSpentOnTrips({
        userId: userId as UUID,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

    return {
      message: 'Total time spent on trips counted successfully',
      data: totalTimeSpent,
    };
  }
}
