import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { Trip } from '../entities/trip.entity';
import { TransportCard } from '../entities/transportCard.entity';
import { UUID } from '../types';
import { UserStatus } from '../constants/user.constants';
import { UserTrip } from '../entities/userTrip.entity';

export class DashboardService {
  private readonly userRepository: Repository<User>;
  private readonly tripRepository: Repository<Trip>;
  private readonly transportCardRepository: Repository<TransportCard>;
  private readonly userTripRepository: Repository<UserTrip>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.tripRepository = AppDataSource.getRepository(Trip);
    this.transportCardRepository = AppDataSource.getRepository(TransportCard);
    this.userTripRepository = AppDataSource.getRepository(UserTrip);
  }

  /**
   * COUNT TOTAL TRIPS
   */
  async countTotalUserTrips({
    userId,
    startDate,
    endDate,
  }: {
    userId?: UUID;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    let condition: FindOptionsWhere<UserTrip> | FindOptionsWhere<UserTrip>[] = {};

    if (userId) {
      condition.userId = userId;
    }

    if (startDate) {
      condition.createdAt = MoreThanOrEqual(startDate);
    }

    if (endDate) {
      condition.createdAt = LessThanOrEqual(endDate);
    }

    return this.userTripRepository.count({
      where: condition,
    });
  }

  /**
   * COUNT TOTAL TRANSPORT CARDS
   */
  async countTotalTransportCards({
    createdById,
    startTime,
    endTime,
  }: {
    createdById?: UUID;
    startTime?: Date;
    endTime?: Date;
  }): Promise<number> {
    let condition:
      | FindOptionsWhere<TransportCard>
      | FindOptionsWhere<TransportCard>[] = {};

    if (createdById) {
      condition.createdById = createdById;
    }

    if (startTime) {
      condition.createdAt = MoreThanOrEqual(startTime);
    }

    if (endTime) {
      condition.createdAt = LessThanOrEqual(endTime);
    }

    return this.transportCardRepository.count({
      where: condition,
    });
  }

  /**
   * COUNT TOTAL USERS
   */
  async countTotalUsers({ status }: { status?: UserStatus }): Promise<number> {
    let condition: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};

    if (status) {
      condition.status = status;
    }

    return this.userRepository.count({
      where: condition,
    });
  }
}
