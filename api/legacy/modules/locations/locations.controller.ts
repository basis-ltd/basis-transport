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
import { FindOptionsWhere, ILike } from 'typeorm';
import { LocationService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';
import { CurrentUser } from '../../common/decorators/auth.decorators';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { UUID } from '../../types';
import { Location } from '../../entities/location.entity';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @HttpCode(201)
  async createLocation(
    @Body() body: CreateLocationDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const location = await this.locationService.createLocation({
      ...(body as Partial<Location>),
      createdById: user.id,
    });
    return {
      message: 'Location created successfully',
      data: location,
    };
  }

  @Get()
  async fetchLocations(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('name') name?: string,
    @Query('description') description?: string
  ) {
    let condition: FindOptionsWhere<Location> | FindOptionsWhere<Location>[] =
      {};

    if (name) {
      condition = [{ name: ILike(`%${name}%`) }];
    }

    if (description) {
      condition = [{ description: ILike(`%${description}%`) }];
    }

    const locations = await this.locationService.fetchLocations({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Locations fetched successfully',
      data: locations,
    };
  }

  @Get(':id')
  async getLocationById(@Param('id') id: string) {
    const location = await this.locationService.getLocationById(id as UUID);
    return {
      message: 'Location fetched successfully',
      data: location,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteLocation(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.locationService.deleteLocation(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Location deleted successfully',
    };
  }

  @Patch(':id')
  async updateLocation(
    @Param('id') id: string,
    @Body() body: UpdateLocationDto
  ) {
    const location = await this.locationService.updateLocation(
      id as UUID,
      body as Partial<Location>
    );
    return {
      message: 'Location updated successfully',
      data: location,
    };
  }
}
