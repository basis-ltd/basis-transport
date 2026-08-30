import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransitRoute } from '../../entities/transitRoute.entity';
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
export class TransitRoutesService {
  constructor(
    @InjectRepository(TransitRoute)
    private readonly transitRouteRepository: Repository<TransitRoute>
  ) {}

  /**
   * FETCH ROUTES
   *
   * `corridor` accepts a uuid or a corridor code (A-G), `agency` a uuid or an
   * agency name - the published handles people actually have.
   */
  async fetchRoutes({
    page,
    size,
    q,
    corridor,
    agency,
    source,
  }: {
    page: number;
    size: number;
    q?: string;
    corridor?: string;
    agency?: string;
    source?: string;
  }): Promise<Pagination<TransitRoute>> {
    const { take, skip } = getPagination({ page, size });

    const queryBuilder = this.transitRouteRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.agency', 'agency')
      .leftJoinAndSelect('route.corridor', 'corridor');

    if (q) {
      queryBuilder.andWhere(
        '(route.shortName ILIKE :q OR route.longName ILIKE :q OR route.description ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    if (corridor) {
      if (isUuid(corridor)) {
        queryBuilder.andWhere('route.corridorId = :corridorId', {
          corridorId: corridor,
        });
      } else {
        queryBuilder.andWhere('corridor.code = :corridorCode', {
          corridorCode: corridor.toUpperCase(),
        });
      }
    }

    if (agency) {
      if (isUuid(agency)) {
        queryBuilder.andWhere('route.agencyId = :agencyId', {
          agencyId: agency,
        });
      } else {
        queryBuilder.andWhere('agency.name ILIKE :agencyName', {
          agencyName: agency,
        });
      }
    }

    if (source) {
      queryBuilder.andWhere('route.source = :source', { source });
    }

    const routes = await queryBuilder
      .orderBy('route.shortName', 'ASC')
      .take(take)
      .skip(skip)
      .getManyAndCount();

    return getPagingData({ data: routes, page, size });
  }

  /**
   * GET ROUTE BY ID OR SHORT NAME
   *
   * Returns the ordered stop sequence and the headway windows.
   */
  async getRouteByIdOrShortName(identifier: string): Promise<TransitRoute> {
    const route = await this.transitRouteRepository.findOne({
      where: isUuid(identifier)
        ? { id: identifier as UUID }
        : { shortName: identifier },
      relations: {
        agency: true,
        corridor: true,
        routeStops: {
          stop: true,
        },
        frequencies: true,
      },
      order: {
        routeStops: {
          sequence: 'ASC',
        },
        frequencies: {
          startTime: 'ASC',
        },
      },
    });

    if (!route) {
      throw new NotFoundError('Route not found', {
        referenceId: identifier,
        referenceType: LogReferenceTypes.TRANSIT_ROUTE,
      });
    }

    return route;
  }
}
