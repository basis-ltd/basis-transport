import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Location } from '../../entities/location.entity';
import { NotFoundError, ValidationError } from '../../helpers/errors.helper';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../../helpers/pagination.helper';
import { UUID } from '../../types';
import { LogReferenceTypes } from '../../constants/logs.constants';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>
  ) {}

  /**
   * CREATE LOCATION
   */
  async createLocation(location: Partial<Location>): Promise<Location> {
    // CHECK IF LOCATION EXISTS
    const existingLocation = await this.locationRepository.findOne({
      where: {
        name: location?.name,
        address: location?.address,
      },
    });

    // IF LOCATION EXISTS, THROW ERROR
    if (existingLocation) {
      throw new ValidationError('Location already exists');
    }

    // CREATE LOCATION
    return this.locationRepository.save({
      ...location,
      createdById: location?.createdById,
    });
  }

  /**
   * FETCH LOCATIONS
   */
  async fetchLocations({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<Location> | FindOptionsWhere<Location>[];
  }): Promise<Pagination<Location>> {
    // GET PAGINATION
    const { take, skip } = getPagination({ page, size });

    // FETCH LOCATIONS
    const locations = await this.locationRepository.findAndCount({
      take,
      skip,
      where: condition,
      relations: {
        createdBy: true,
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    // RETURN PAGINATION
    return getPagingData({ data: locations, page, size });
  }

  /**
   * GET LOCATION BY ID
   */
  async getLocationById(id: UUID): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: {
        createdBy: true,
      },
    });

    // IF LOCATION DOES NOT EXIST, THROW ERROR
    if (!location) {
      throw new NotFoundError('Location not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.LOCATION,
      });
    }

    // RETURN LOCATION
    return location;
  }

  /**
   * DELETE LOCATION
   */
  async deleteLocation(
    id: UUID,
    _metadata?: { createdById?: UUID }
  ): Promise<void> {
    const location = await this.getLocationById(id);
    await this.locationRepository.delete(location?.id);
  }

  /**
   * UPDATE LOCATION
   */
  async updateLocation(
    id: UUID,
    location: Partial<Location>
  ): Promise<Location> {
    // UPDATE LOCATION
    const existingLocation = await this.getLocationById(id);

    // UPDATE LOCATION
    return this.locationRepository.save({
      ...existingLocation,
      ...location,
    });
  }
}
