import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  CurrentUser,
  Roles,
} from '../../common/decorators/auth.decorators';
import { RoleTypes } from '../../constants/role.constants';
import { AuthenticatedUser } from '../../common/types/auth.types';

@Controller('insights')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('commuter')
  async getCommuterSummary(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.dashboardService.getCommuterSummary(user.id);
    return {
      message: 'Commuter summary fetched successfully',
      data,
    };
  }

  @Get('driver')
  @Roles(RoleTypes.DRIVER, RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN)
  async getDriverSummary(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.dashboardService.getDriverSummary(user.id);
    return {
      message: 'Driver summary fetched successfully',
      data,
    };
  }

  @Get('overview')
  @Roles(RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN)
  async getOverview() {
    const data = await this.dashboardService.getOverview();
    return {
      message: 'Operations overview fetched successfully',
      data,
    };
  }
}
