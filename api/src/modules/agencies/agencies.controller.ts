import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { AgenciesService } from './agencies.service';
import { Public } from '../../common/decorators/auth.decorators';
import { Agency } from '../../entities/agency.entity';
import { NotFoundError } from '../../helpers/errors.helper';
import { isUuid } from '../../helpers/uuid.helper';
import { LogReferenceTypes } from '../../constants/logs.constants';
import { UUID } from '../../types';

@Controller('agencies')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Public()
  @Get()
  async fetchAgencies(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('q') q?: string,
    @Query('source') source?: string
  ) {
    const condition: FindOptionsWhere<Agency> = {};

    if (q) {
      condition.name = ILike(`%${q}%`);
    }

    if (source) {
      condition.source = source;
    }

    const agencies = await this.agenciesService.fetchAgencies({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Agencies fetched successfully',
      data: agencies,
    };
  }

  @Public()
  @Get(':id')
  async getAgencyById(@Param('id') id: string) {
    if (!isUuid(id)) {
      throw new NotFoundError('Agency not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.AGENCY,
      });
    }

    const agency = await this.agenciesService.getAgencyById(id as UUID);

    return {
      message: 'Agency fetched successfully',
      data: agency,
    };
  }
}
