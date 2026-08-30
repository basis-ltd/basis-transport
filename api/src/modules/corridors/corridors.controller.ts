import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { CorridorsService } from './corridors.service';
import { Public } from '../../common/decorators/auth.decorators';
import { Corridor } from '../../entities/corridor.entity';

@Controller('corridors')
export class CorridorsController {
  constructor(private readonly corridorsService: CorridorsService) {}

  @Public()
  @Get()
  async fetchCorridors(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('q') q?: string,
    @Query('source') source?: string
  ) {
    let condition: FindOptionsWhere<Corridor> | FindOptionsWhere<Corridor>[] =
      {};

    if (source) {
      condition = { source };
    }

    if (q) {
      const base = source ? { source } : {};
      condition = [
        { ...base, name: ILike(`%${q}%`) },
        { ...base, code: ILike(`%${q}%`) },
        { ...base, fromHub: ILike(`%${q}%`) },
        { ...base, toHub: ILike(`%${q}%`) },
      ];
    }

    const corridors = await this.corridorsService.fetchCorridors({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Corridors fetched successfully',
      data: corridors,
    };
  }

  @Public()
  @Get(':id')
  async getCorridorById(@Param('id') id: string) {
    const corridor = await this.corridorsService.getCorridorByIdOrCode(id);

    return {
      message: 'Corridor fetched successfully',
      data: corridor,
    };
  }
}
