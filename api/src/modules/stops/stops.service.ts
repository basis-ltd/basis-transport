import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Stop } from '../../entities/networkStop.entity';
import { NotFoundError } from '../../helpers/errors.helper';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../../helpers/pagination.helper';
import { UUID } from '../../types';
import { LogReferenceTypes } from '../../constants/logs.constants';
import { isUuid } from '../../helpers/uuid.helper';
import { StopType } from '../../constants/network.constants';

export type NearbyStop = Stop & { distanceMeters: number };

@Injectable()
export class StopsService {
  constructor(
    @InjectRepository(Stop)
    private readonly stopRepository: Repository<Stop>
  ) {}

  /**
   * FETCH STOPS
   */
  async fetchStops({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<Stop> | FindOptionsWhere<Stop>[];
  }): Promise<Pagination<Stop>> {
    const { take, skip } = getPagination({ page, size });

    const stops = await this.stopRepository.findAndCount({
      take,
      skip,
      where: condition,
      order: {
        name: 'ASC',
      },
    });

    return getPagingData({ data: stops, page, size });
  }

  /**
   * FETCH NEARBY STOPS
   *
   * Ranks stops by PostGIS distance to the given coordinate. Stops without a
   * geometry (published names with no surveyed point) are excluded.
   */
  async fetchNearbyStops({
    lat,
    lng,
    page,
    size,
    q,
    stopType,
    source,
  }: {
    lat: number;
    lng: number;
    page: number;
    size: number;
    q?: string;
    stopType?: StopType;
    source?: string;
  }): Promise<Pagination<NearbyStop>> {
    const { take, skip } = getPagination({ page, size });

    const queryBuilder = this.stopRepository
      .createQueryBuilder('stop')
      .where('stop.location IS NOT NULL');

    if (q) {
      queryBuilder.andWhere('stop.name ILIKE :q', { q: `%${q}%` });
    }

    if (stopType) {
      queryBuilder.andWhere('stop.stopType = :stopType', { stopType });
    }

    if (source) {
      queryBuilder.andWhere('stop.source = :source', { source });
    }

    const totalCount = await queryBuilder.getCount();

    const { entities, raw } = await queryBuilder
      .addSelect(
        'ST_Distance(stop.location::geography, ST_SetSRID(ST_GeomFromText(:origin), 4326)::geography)',
        'distance_meters'
      )
      .setParameters({ origin: `POINT(${lng} ${lat})` })
      .orderBy('distance_meters', 'ASC')
      .limit(take)
      .offset(skip)
      .getRawAndEntities<{ distance_meters: string }>();

    const rows = entities.map(
      (stop, index) =>
        ({
          ...stop,
          distanceMeters: Number(raw[index]?.distance_meters ?? 0),
        }) as NearbyStop
    );

    return getPagingData({ data: [rows, totalCount], page, size });
  }

  /**
   * GET STOP BY ID OR CODE
   */
  async getStopByIdOrCode(identifier: string): Promise<Stop> {
    const stop = await this.stopRepository.findOne({
      where: isUuid(identifier)
        ? { id: identifier as UUID }
        : { code: identifier },
    });

    if (!stop) {
      throw new NotFoundError('Stop not found', {
        referenceId: identifier,
        referenceType: LogReferenceTypes.STOP,
      });
    }

    return stop;
  }
}
