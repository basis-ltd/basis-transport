import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransitRoutesService } from './transit-routes.service';
import { Public } from '../../common/decorators/auth.decorators';

/**
 * Published bus lines. The entity is `TransitRoute` to stay clear of Express's
 * own `Route`, but the public path is `/api/routes`.
 */
@Controller('routes')
export class TransitRoutesController {
  constructor(private readonly transitRoutesService: TransitRoutesService) {}

  @Public()
  @Get()
  async fetchRoutes(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('q') q?: string,
    @Query('corridor') corridor?: string,
    @Query('agency') agency?: string,
    @Query('source') source?: string
  ) {
    const routes = await this.transitRoutesService.fetchRoutes({
      page: Number(page),
      size: Number(size),
      q,
      corridor,
      agency,
      source,
    });

    return {
      message: 'Routes fetched successfully',
      data: routes,
    };
  }

  @Public()
  @Get(':id')
  async getRouteById(@Param('id') id: string) {
    const route =
      await this.transitRoutesService.getRouteByIdOrShortName(id);

    return {
      message: 'Route fetched successfully',
      data: route,
    };
  }
}
