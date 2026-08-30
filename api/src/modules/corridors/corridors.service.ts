import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Corridor } from '../../entities/corridor.entity';
import { NotFoundError } from '../../helpers/errors.helper';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../../helpers/pagination.helper';
import { UUID } from '../../types';
import { LogReferenceTypes } from '../../constants/logs.constants';
import { isUuid } from '../../helpers/uuid.helper';

@Injectable()
export class CorridorsService {
  constructor(
    @InjectRepository(Corridor)
    private readonly corridorRepository: Repository<Corridor>
  ) {}

  /**
   * FETCH CORRIDORS
   */
  async fetchCorridors({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<Corridor> | FindOptionsWhere<Corridor>[];
  }): Promise<Pagination<Corridor>> {
    const { take, skip } = getPagination({ page, size });

    const corridors = await this.corridorRepository.findAndCount({
      take,
      skip,
      where: condition,
      order: {
        code: 'ASC',
      },
    });

    return getPagingData({ data: corridors, page, size });
  }

  /**
   * GET CORRIDOR BY ID OR CODE
   *
   * Corridors are published as letters (A-G), so the public endpoint accepts
   * either the uuid or the corridor code.
   */
  async getCorridorByIdOrCode(identifier: string): Promise<Corridor> {
    const corridor = await this.corridorRepository.findOne({
      where: isUuid(identifier)
        ? { id: identifier as UUID }
        : { code: identifier.toUpperCase() },
    });

    if (!corridor) {
      throw new NotFoundError('Corridor not found', {
        referenceId: identifier,
        referenceType: LogReferenceTypes.CORRIDOR,
      });
    }

    return corridor;
  }
}
