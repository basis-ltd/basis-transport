import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { Trip } from '../../entities/trip.entity';
import { TransportCard } from '../../entities/transportCard.entity';
import { UUID } from '../../types';
import { UserStatus } from '../../constants/user.constants';
import { UserTrip } from '../../entities/userTrip.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(TransportCard)
    private readonly transportCardRepository: Repository<TransportCard>,
    @InjectRepository(UserTrip)
    private readonly userTripRepository: Repository<UserTrip>
  ) {}

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
    const condition: FindOptionsWhere<UserTrip> | FindOptionsWhere<UserTrip>[] =
      {};

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
    const condition:
      FindOptionsWhere<TransportCard> | FindOptionsWhere<TransportCard>[] = {};

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
    const condition: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};

    if (status) {
      condition.status = status;
    }

    return this.userRepository.count({
      where: condition,
    });
  }

  /**
   * PUBLIC LANDING STATS (unauthenticated aggregate counts)
   */
  async getPublicLandingStats(): Promise<{ commutes: number; users: number }> {
    const [commutes, users] = await Promise.all([
      this.countTotalUserTrips({}),
      this.countTotalUsers({ status: UserStatus.ACTIVE }),
    ]);
    return { commutes, users };
  }

  /**
   * COUNT TOTAL TIME SPENT ON TRIPS
   */
  async countTotalTimeSpentOnTrips({
    userId,
    startDate,
    endDate,
  }: {
    userId?: UUID;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const condition: FindOptionsWhere<UserTrip> | FindOptionsWhere<UserTrip>[] =
      {};

    if (userId) {
      condition.userId = userId;
    }

    if (startDate) {
      condition.createdAt = MoreThanOrEqual(startDate);
    }

    if (endDate) {
      condition.createdAt = LessThanOrEqual(endDate);
    }

    const userTrips = await this.userTripRepository.find({
      where: condition,
    });

    let totalTimeSpent = 0;

    for (const trip of userTrips) {
      const startTime = new Date(trip.startTime).getTime();
      const endTime = new Date(trip.endTime).getTime();
      const timeSpentInSeconds = (endTime - startTime) / 1000;
      totalTimeSpent += timeSpentInSeconds;
    }

    return Math.round(totalTimeSpent);
  }
}
