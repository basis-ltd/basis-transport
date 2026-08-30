import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { StopsService } from './stops.service';
import { Public } from '../../common/decorators/auth.decorators';
import { Stop } from '../../entities/networkStop.entity';
import { StopType } from '../../constants/network.constants';
import { ValidationError } from '../../helpers/errors.helper';

@Controller('stops')
export class StopsController {
  constructor(private readonly stopsService: StopsService) {}

  @Public()
  @Get()
  async fetchStops(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('q') q?: string,
    @Query('stopType') stopType?: StopType,
    @Query('source') source?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string
  ) {
    const parsedPage = Number(page);
    const parsedSize = Number(size);

    if (stopType && !Object.values(StopType).includes(stopType)) {
      throw new ValidationError(
        `stopType must be one of ${Object.values(StopType).join(', ')}`
      );
    }

    // NEARBY SEARCH
    if (lat !== undefined || lng !== undefined) {
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);

      if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
        throw new ValidationError('lat and lng must be valid numbers');
      }

      const nearbyStops = await this.stopsService.fetchNearbyStops({
        lat: parsedLat,
        lng: parsedLng,
        page: parsedPage,
        size: parsedSize,
        q,
        stopType,
        source,
      });

      return {
        message: 'Stops fetched successfully',
        data: nearbyStops,
      };
    }

    let condition: FindOptionsWhere<Stop> | FindOptionsWhere<Stop>[] = {};
    const base: FindOptionsWhere<Stop> = {};

    if (stopType) {
      base.stopType = stopType;
    }

    if (source) {
      base.source = source;
    }

    condition = q
      ? [
          { ...base, name: ILike(`%${q}%`) },
          { ...base, code: ILike(`%${q}%`) },
        ]
      : base;

    const stops = await this.stopsService.fetchStops({
      page: parsedPage,
      size: parsedSize,
      condition,
    });

    return {
      message: 'Stops fetched successfully',
      data: stops,
    };
  }

  @Public()
  @Get(':id')
  async getStopById(@Param('id') id: string) {
    const stop = await this.stopsService.getStopByIdOrCode(id);

    return {
      message: 'Stop fetched successfully',
      data: stop,
    };
  }
}
