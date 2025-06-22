import { FindOptionsWhere, Repository } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { AppDataSource } from '../data-source';
import {
  createTripValidation,
  updateTripValidation,
} from '../validations/trip.validations';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { LocationService } from './location.service';
import { Location } from '../entities/location.entity';
import { User } from '../entities/user.entity';
import { LogReferenceTypes } from '../constants/logs.constants';
import { generateReferenceId } from '../helpers/string.helper';
import { AuditDelete, AuditUpdate } from '../decorators/auditLog.decorator';
import { UUID } from '../types';
import { getPagingData } from '../helpers/pagination.helper';
import { getPagination, Pagination } from '../helpers/pagination.helper';
import { UserTrip } from '../entities/userTrip.entity';
import { UserTripStatus } from '../constants/userTrip.constants';
import { TripStatus } from '../constants/trip.constants';

export class TripService {
  private readonly tripRepository: Repository<Trip>;
  private readonly locationRepository: Repository<Location>;
  private readonly userRepository: Repository<User>;
  private readonly userTripRepository: Repository<UserTrip>;

  constructor() {
    this.tripRepository = AppDataSource.getRepository(Trip);
    this.locationRepository = AppDataSource.getRepository(Location);
    this.userRepository = AppDataSource.getRepository(User);
    this.userTripRepository = AppDataSource.getRepository(UserTrip);
  }

  /**
   *
   * @param trip
   * @returns
   * CREATE TRIP
   */
  async createTrip(trip: Trip): Promise<Trip> {
    // VALIDATE TRIP
    const { error, value } = createTripValidation(trip);
    if (error) {
      throw new ValidationError(error.message);
    }

    // CHECK IF LOCATION FROM EXISTS
    let locationFrom: Location | null = null;
    locationFrom = await this.locationRepository.findOne({
      where: { id: value?.locationFromId },
    });

    if (!locationFrom) {
      throw new ValidationError('Starting location not found', {
        referenceId: value?.locationFromId,
        referenceType: LogReferenceTypes.LOCATION,
      });
    }

    // CHECK IF LOCATION TO EXISTS
    let locationTo: Location | null = null;
    if (value?.locationToId) {
      locationTo = await this.locationRepository.findOne({
        where: { id: value?.locationToId },
      });

      if (!locationTo) {
        throw new ValidationError('Destination location not found', {
          referenceId: value?.locationToId,
          referenceType: LogReferenceTypes.LOCATION,
        });
      }
    }

    // CHECK IF CREATED BY EXISTS
    let createdBy: User | null = null;
    createdBy = await this.userRepository.findOne({
      where: { id: value?.createdById },
    });

    if (!createdBy) {
      throw new NotFoundError('Created by not found', {
        referenceId: value?.createdById,
        referenceType: LogReferenceTypes.USER,
      });
    }

    // GENERATE REFERENCE ID
    let referenceId = generateReferenceId(5, 'TRIP');

    // CHECK IF REFERENCE ID IS UNIQUE
    while (await this.tripRepository.findOne({ where: { referenceId } })) {
      referenceId = generateReferenceId(5, 'TRIP');
    }

    // CREATE TRIP
    const newTrip = this.tripRepository.save({
      ...value,
      referenceId,
      locationFrom,
      locationTo,
      createdBy,
    });

    return newTrip;
  }

  /**
   * UPDATE TRIP
   * @param trip
   * @returns
   */
  @AuditUpdate({
    entityType: 'Trip',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async updateTrip(
    id: UUID,
    trip: Partial<Trip>,
    metadata?: { createdById?: UUID }
  ): Promise<Trip> {
    // VALIDATE TRIP
    const { error, value } = updateTripValidation(trip);
    if (error) {
      throw new ValidationError(error.message);
    }

    // CHECK IF TRIP EXISTS
    const existingTrip = await this.tripRepository.findOne({
      where: { id },
    });

    if (!existingTrip) {
      throw new NotFoundError('Trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // CHECK IF LOCATION FROM EXISTS
    let locationFrom: Location | null = null;
    if (value?.locationFromId) {
      locationFrom = await this.locationRepository.findOne({
        where: { id: value?.locationFromId },
      });
    }

    // CHECK IF LOCATION TO EXISTS
    let locationTo: Location | null = null;
    if (value?.locationToId) {
      locationTo = await this.locationRepository.findOne({
        where: { id: value?.locationToId },
      });
    }

    // UPDATE LOCATION
    const updatedTrip = await this.tripRepository.save({
      ...existingTrip,
      ...value,
      locationFrom,
      locationTo,
    });

    return updatedTrip;
  }

  /**
   * DELETE TRIP
   * @param id
   * @returns
   */
  @AuditDelete({
    entityType: 'Trip',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async deleteTrip(id: UUID, metadata?: { createdById?: UUID }): Promise<void> {
    // CHECK IF TRIP EXISTS
    const existingTrip = await this.tripRepository.findOne({
      where: { id: id as UUID },
    });

    if (!existingTrip) {
      throw new NotFoundError('Trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // DELETE TRIP
    await this.tripRepository.delete(id);
  }

  /**
   * FETCH TRIPS
   * @param page
   * @param limit
   * @returns
   */
  async fetchTrips({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<Trip> | FindOptionsWhere<Trip>[];
  }): Promise<Pagination<Trip>> {
    // GET PAGINATION
    const { take, skip } = getPagination({ page, size });

    const trips = await this.tripRepository.findAndCount({
      skip,
      take,
      where: condition,
      relations: {
        locationFrom: true,
        locationTo: true,
        createdBy: true,
      },
      order: {
        updatedAt: 'DESC',
      }
    });

    return getPagingData({
      data: trips,
      page,
      size,
    });
  }

  /**
   * GET TRIP BY ID
   * @param id
   * @returns
   */
  async getTripById(id: UUID): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id: id as UUID },
      relations: {
        locationFrom: true,
        locationTo: true,
        createdBy: true,
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    return trip;
  }

  /**
   * GET TRIP BY REFERENCE ID
   * @param referenceId
   * @returns
   */
  async getTripByReferenceId(referenceId: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { referenceId },
      relations: {
        locationFrom: true,
        locationTo: true,
        createdBy: true,
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found', {
        referenceId,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    return trip;
  }

  /**
   * COUNT AVAILABLE CAPACITY
   */
  async countAvailableCapacity(tripId: UUID): Promise<{
    availableCapacity: number;
    totalCapacity: number;
  }> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId as UUID },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found', {
        referenceId: tripId,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    const inProgressUserTrips = await this.userTripRepository.find({
      where: {
        tripId: trip?.id,
        status: UserTripStatus.IN_PROGRESS,
      },
    });

    return {
      availableCapacity: trip.totalCapacity - inProgressUserTrips.length,
      totalCapacity: trip.totalCapacity,
    };
  }

  /**
   * START TRIP
   */
  @AuditUpdate({
    entityType: 'Trip',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async startTrip(id: UUID, metadata?: { createdById?: UUID }): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id: id as UUID },
      relations: {
        locationFrom: true,
        locationTo: true,
        createdBy: true,
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // CHECK IF TRIP IS PENDING
    if (trip.status !== TripStatus.PENDING) {
      throw new ValidationError('Trip is not pending', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // UPDATE TRIP STATUS
    trip.status = TripStatus.IN_PROGRESS;
    trip.startTime = new Date();

    return await this.tripRepository.save(trip);
  }

  /**
   * COMPLETE TRIP
   */
  @AuditUpdate({
    entityType: 'Trip',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async completeTrip(id: UUID, metadata?: { createdById?: UUID }): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id: id as UUID },
      relations: {
        locationFrom: true,
        locationTo: true,
        createdBy: true,
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // CHECK IF TRIP IS IN PROGRESS
    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new ValidationError('Trip is not in progress', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // FIND USER TRIP
    const userTrips = await this.userTripRepository.find({
      where: {
        tripId: trip?.id,
        status: UserTripStatus.IN_PROGRESS,
      },
    });

    // UPDATE USER TRIP STATUS
    await Promise.all(
      userTrips.map((userTrip) =>
        this.userTripRepository.update(userTrip.id, {
          status: UserTripStatus.COMPLETED,
          endTime: new Date(),
        })
      )
    );

    // UPDATE TRIP STATUS
    trip.status = TripStatus.COMPLETED;
    trip.endTime = new Date();

    return await this.tripRepository.save(trip);
  }
  
  /**
   * CANCEL TRIP
   */
  @AuditUpdate({
    entityType: 'Trip',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async cancelTrip(id: UUID, metadata?: { createdById?: UUID }): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id: id as UUID },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // CHECK IF TRIP IS PENDING OR IN PROGRESS
    if (
      trip.status !== TripStatus.PENDING &&
      trip.status !== TripStatus.IN_PROGRESS
    ) {
      throw new ValidationError('Trip is not pending or in progress', {
        referenceId: id,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    // FIND USER TRIP
    const userTrips = await this.userTripRepository.find({
      where: {
        tripId: trip?.id,
        status: UserTripStatus.IN_PROGRESS,
      },
    });

    // UPDATE USER TRIP STATUS
    await Promise.all(
      userTrips.map((userTrip) =>
        this.userTripRepository.update(userTrip.id, {
          status: UserTripStatus.CANCELLED,
          endTime: new Date(),
        })
      )
    );

    // UPDATE TRIP STATUS
    trip.status = TripStatus.CANCELLED;
    trip.endTime = new Date();

    return await this.tripRepository.save(trip);
  }
}
