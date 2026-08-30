import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Agency } from '../../entities/agency.entity';
import { NotFoundError } from '../../helpers/errors.helper';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../../helpers/pagination.helper';
import { UUID } from '../../types';
import { LogReferenceTypes } from '../../constants/logs.constants';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private readonly agencyRepository: Repository<Agency>
  ) {}

  /**
   * FETCH AGENCIES
   */
  async fetchAgencies({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<Agency> | FindOptionsWhere<Agency>[];
  }): Promise<Pagination<Agency>> {
    const { take, skip } = getPagination({ page, size });

    const agencies = await this.agencyRepository.findAndCount({
      take,
      skip,
      where: condition,
      order: {
        name: 'ASC',
      },
    });

    return getPagingData({ data: agencies, page, size });
  }

  /**
   * GET AGENCY BY ID
   */
  async getAgencyById(id: UUID): Promise<Agency> {
    const agency = await this.agencyRepository.findOne({ where: { id } });

    if (!agency) {
      throw new NotFoundError('Agency not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.AGENCY,
      });
    }

    return agency;
  }
}
