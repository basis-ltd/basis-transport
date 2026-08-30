import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserTrip } from '../../entities/userTrip.entity';
import { NotFoundError, ValidationError } from '../../helpers/errors.helper';
import { User } from '../../entities/user.entity';
import { Trip } from '../../entities/trip.entity';
import { LogReferenceTypes } from '../../constants/logs.constants';
import { UUID } from '../../types';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../../helpers/pagination.helper';
import { UserTripStatus } from '../../constants/userTrip.constants';

@Injectable()
export class UserTripService {
  constructor(
    @InjectRepository(UserTrip)
    private readonly userTripRepository: Repository<UserTrip>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>
  ) {}

  /**
   * CREATE USER TRIP
   * @param userTrip
   * @returns
   */
  async createUserTrip(userTrip: Partial<UserTrip>): Promise<UserTrip> {
    // CHECK IF USER EXISTS
    const userExists = await this.userRepository.findOne({
      where: { id: userTrip?.userId },
    });

    if (!userExists) {
      throw new ValidationError('User not found', {
        referenceId: userTrip?.userId,
        referenceType: LogReferenceTypes.USER_TRIP,
      });
    }

    // CHECK IF TRIP EXISTS
    const tripExists = await this.tripRepository.findOne({
      where: { id: userTrip?.tripId },
    });

    if (!tripExists) {
      throw new ValidationError('Trip not found', {
        referenceId: userTrip?.tripId,
        referenceType: LogReferenceTypes.USER_TRIP,
      });
    }

    // CHECK IF CREATED BY EXISTS
    const createdByIdExists = await this.userRepository.findOne({
      where: { id: userTrip?.createdById },
    });

    if (!createdByIdExists) {
      throw new ValidationError('Created by not found', {
        referenceId: userTrip?.createdById,
        referenceType: LogReferenceTypes.USER_TRIP,
      });
    }

    // CHECK IF USER TRIP ALREADY EXISTS
    const userTripExists = await this.userTripRepository.findOne({
      where: { userId: userTrip?.userId, tripId: userTrip?.tripId },
      relations: {
        trip: true,
        user: true,
        createdBy: true,
      },
    });

    if (userTripExists) {
      // Re-boarding on the same (user, trip): reset exit from a prior completed leg
      userTripExists.status = UserTripStatus.IN_PROGRESS;
      userTripExists.entranceLocation =
        userTrip.entranceLocation as UserTrip['entranceLocation'];
      userTripExists.startTime = userTrip?.startTime || new Date();
      userTripExists.exitLocation = null as unknown as UserTrip['exitLocation'];
      userTripExists.endTime = null as unknown as UserTrip['endTime'];

      return await this.userTripRepository.save(userTripExists);
    }

    return await this.userTripRepository.save({
      ...userTrip,
      startTime: userTrip?.startTime || new Date(),
      user: userExists,
      trip: tripExists,
      createdBy: createdByIdExists,
    });
  }

  /**
   * UPDATE USER TRIP
   * @param id
   * @param userTrip
   * @returns
   */
  async updateUserTrip(
    id: UUID,
    userTrip: Partial<UserTrip>
  ): Promise<UserTrip> {
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

    return await this.userTripRepository.save({
      ...userTripExists,
      ...userTrip,
    });
  }

  /**
   * DELETE USER TRIP
   */
  async deleteUserTrip(
    id: UUID,
    _metadata?: { createdById?: UUID }
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
