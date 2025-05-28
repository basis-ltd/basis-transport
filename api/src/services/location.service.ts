import { FindOptionsWhere, Repository } from 'typeorm';
import { Location } from '../entities/location.entity';
import { AppDataSource } from '../data-source';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import {
  createLocationValidation,
  updateLocationValidation,
} from '../validations/location.validations';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { UUID } from '../types';
import { LogReferenceTypes } from '../constants/logs.constants';
import { AuditDelete, AuditUpdate } from '../decorators/auditLog.decorator';

export class LocationService {
  private readonly locationRepository: Repository<Location>;

  constructor() {
    this.locationRepository = AppDataSource.getRepository(Location);
  }

  /**
   * CREATE LOCATION
   */
  async createLocation(location: Partial<Location>): Promise<Location> {
    // VALIDATE LOCATION
    const { error, value } = createLocationValidation(location);
    if (error) {
      throw new ValidationError(error.message);
    }

    // CHECK IF LOCATION EXISTS
    const existingLocation = await this.locationRepository.findOne({
      where: {
        name: value?.name,
        address: value?.address,
      },
    });

    // IF LOCATION EXISTS, THROW ERROR
    if (existingLocation) {
      throw new ValidationError('Location already exists');
    }

    // CREATE LOCATION
    return this.locationRepository.save({
      ...value,
      createdById: value?.createdById,
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
      }
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
      }
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
  @AuditDelete({
    entityType: 'Location',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById
  })
  async deleteLocation(id: UUID, metadata?: { createdById?: UUID }): Promise<void> {
    const location = await this.getLocationById(id);
    await this.locationRepository.delete(location?.id);
  }

  /**
   * UPDATE LOCATION
   */
  @AuditUpdate({
    entityType: 'Location',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById
  })
  async updateLocation(
    id: UUID,
    location: Partial<Location>
  ): Promise<Location> {
    // VALIDATE LOCATION
    const { error, value } = updateLocationValidation(location);
    if (error) {
      throw new ValidationError(error.message);
    }

    // UPDATE LOCATION
    const existingLocation = await this.getLocationById(id);

    // UPDATE LOCATION
    return this.locationRepository.save({
      ...existingLocation,
      ...value,
    });
  }
}
