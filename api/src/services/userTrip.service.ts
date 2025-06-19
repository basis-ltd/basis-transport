import { FindOptionsWhere, Repository } from 'typeorm';
import { UserTrip } from '../entities/userTrip.entity';
import { AppDataSource } from '../data-source';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import {
  createUserTripValidation,
  updateUserTripValidation,
} from '../validations/userTrip.validations';
import { User } from '../entities/user.entity';
import { Trip } from '../entities/trip.entity';
import { LogReferenceTypes } from '../constants/logs.constants';
import { UUID } from '../types';
import { AuditDelete, AuditUpdate } from '../decorators/auditLog.decorator';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';

export class UserTripService {
  private readonly userTripRepository: Repository<UserTrip>;
  private readonly userRepository: Repository<User>;
  private readonly tripRepository: Repository<Trip>;

  constructor() {
    this.userTripRepository = AppDataSource.getRepository(UserTrip);
    this.userRepository = AppDataSource.getRepository(User);
    this.tripRepository = AppDataSource.getRepository(Trip);
  }

  /**
   * CREATE USER TRIP
   * @param userTrip
   * @returns
   */
  async createUserTrip(userTrip: Partial<UserTrip>): Promise<UserTrip> {
    // VALIDATE USER TRIP
    const { error, value } = createUserTripValidation(userTrip);
    if (error) {
      throw new ValidationError(error.message);
    }

    // CHECK IF USER EXISTS
    const userExists = await this.userRepository.findOne({
      where: { id: value?.userId },
    });

    if (!userExists) {
      throw new ValidationError('User not found', {
        referenceId: value?.userId,
        referenceType: LogReferenceTypes.USER_TRIP,
      });
    }

    // CHECK IF TRIP EXISTS
    const tripExists = await this.tripRepository.findOne({
      where: { id: value?.tripId },
    });

    if (!tripExists) {
      throw new ValidationError('Trip not found', {
        referenceId: value?.tripId,
        referenceType: LogReferenceTypes.USER_TRIP,
      });
    }

    // CHECK IF CREATED BY EXISTS
    const createdByIdExists = await this.userRepository.findOne({
      where: { id: value?.createdById },
    });

    if (!createdByIdExists) {
      throw new ValidationError('Created by not found', {
        referenceId: value?.createdById,
        referenceType: LogReferenceTypes.USER_TRIP,
      });
    }

    // CREATE USER TRIP
    const newUserTrip = this.userTripRepository.save({
      ...value,
      startTime: value?.startTime || new Date(),
      user: userExists,
      trip: tripExists,
      createdBy: createdByIdExists,
    });

    return newUserTrip;
  }

  /**
   * UPDATE USER TRIP
   * @param id
   * @param userTrip
   * @returns
   */
  @AuditUpdate({
    entityType: 'UserTrip',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async updateUserTrip(
    id: UUID,
    userTrip: Partial<UserTrip>
  ): Promise<UserTrip> {
    // VALIDATE USER TRIP
    const { error, value } = updateUserTripValidation(userTrip);

    if (error) {
      throw new ValidationError(error.message);
    }

    // CHECK IF USER TRIP EXISTS
    const userTripExists = await this.userTripRepository.findOne({
      where: { id },
    });

    if (!userTripExists) {
      throw new ValidationError('User trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.USER_TRIP,
      });
    }

    // UPDATE USER TRIP
    const updatedUserTrip = this.userTripRepository.save({
      ...userTripExists,
      ...value,
    });

    return updatedUserTrip;
  }

  /**
   * DELETE USER TRIP
   */
  @AuditDelete({
    entityType: 'UserTrip',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async deleteUserTrip(
    id: UUID,
    metadata?: { createdById?: UUID }
  ): Promise<void> {
    // CHECK IF USER TRIP EXISTS
    const userTripExists = await this.userTripRepository.findOne({
      where: { id },
    });

    if (!userTripExists) {
      throw new NotFoundError('User trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.USER_TRIP,
      });
    }

    // DELETE USER TRIP
    await this.userTripRepository.delete(id);
  }

  /**
   * GET USER TRIP BY ID
   * @param id
   * @returns
   */
  async getUserTripById(id: UUID): Promise<UserTrip> {
    const userTrip = await this.userTripRepository.findOne({
      where: { id },
      relations: {
        user: true,
        trip: true,
        createdBy: true,
      },
    });

    if (!userTrip) {
      throw new NotFoundError('User trip not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.USER_TRIP,
      });
    }

    return userTrip;
  }

  /**
   * FETCH USER TRIPS
   */
  async fetchUserTrips({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<UserTrip> | FindOptionsWhere<UserTrip>[];
  }): Promise<Pagination<UserTrip>> {
    // GET PAGINATION
    const { skip, take } = getPagination({ page, size });

    const userTrips = await this.userTripRepository.findAndCount({
      skip,
      take,
      where: condition,
      relations: {
        user: true,
        trip: true,
      },
      order: {
        startTime: 'DESC',
      },
    });

    return getPagingData({
      data: userTrips,
      page,
      size,
    });
  }
}
