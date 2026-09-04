import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../../entities/trip.entity';
import { UserTrip } from '../../entities/userTrip.entity';
import { User } from '../../entities/user.entity';
import { TransportCard } from '../../entities/transportCard.entity';
import { UserTripStatus } from '../../constants/userTrip.constants';
import { UUID } from '../../types';

export interface DailyBucket {
  day: string;
  count: number;
}

export interface CommuterSummary {
  nextTrip: UserTrip | null;
  tripsThisWeek: number;
  completedTrips: number;
  totalTrips: number;
  dailyVolume: DailyBucket[];
}

export interface DriverSummary {
  todaysTrips: UserTrip[];
  currentTrip: UserTrip | null;
  completedThisWeek: number;
  totalTrips: number;
}

export interface TripsByStatus {
  status: string;
  count: number;
}

export interface OverviewSummary {
  tripsByStatus: TripsByStatus[];
  activeTrips: number;
  userTripsDaily: DailyBucket[];
  signupsDaily: DailyBucket[];
  totalUsers: number;
  incompleteRegistrations: number;
  transportCards: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

const USER_TRIP_SELECT = [
  'userTrip.id',
  'userTrip.userId',
  'userTrip.tripId',
  'userTrip.status',
  'userTrip.startTime',
  'userTrip.endTime',
  'userTrip.createdAt',
] as const;

const TRIP_SELECT = [
  'trip.id',
  'trip.referenceId',
  'trip.status',
  'trip.startTime',
  'trip.endTime',
  'trip.locationFromId',
  'trip.locationToId',
  'trip.totalCapacity',
] as const;

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserTrip)
    private readonly userTripRepository: Repository<UserTrip>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TransportCard)
    private readonly transportCardRepository: Repository<TransportCard>
  ) {}

  /**
   * COMMUTER SUMMARY
   * Next upcoming trip + personal volume stats for the signed-in user.
   */
  async getCommuterSummary(userId: UUID): Promise<CommuterSummary> {
    const now = new Date();
    const weekStart = addDays(now, -6);

    const nextTrip = await this.userTripRepository
      .createQueryBuilder('userTrip')
      .leftJoin('userTrip.trip', 'trip')
      .select([...USER_TRIP_SELECT])
      .addSelect([...TRIP_SELECT])
      .where('userTrip.userId = :userId', { userId })
      .andWhere('userTrip.startTime >= :now', { now })
      .andWhere('userTrip.status != :cancelled', {
        cancelled: UserTripStatus.CANCELLED,
      })
      .orderBy('userTrip.startTime', 'ASC')
      .limit(1)
      .getOne();

    const [tripsThisWeek, completedTrips, totalTrips] = await Promise.all([
      this.userTripRepository
        .createQueryBuilder('userTrip')
        .where('userTrip.userId = :userId', { userId })
        .andWhere('userTrip.startTime >= :weekStart', {
          weekStart: startOfDay(weekStart),
        })
        .getCount(),
      this.userTripRepository
        .createQueryBuilder('userTrip')
        .where('userTrip.userId = :userId', { userId })
        .andWhere('userTrip.status = :status', {
          status: UserTripStatus.COMPLETED,
        })
        .getCount(),
      this.userTripRepository
        .createQueryBuilder('userTrip')
        .where('userTrip.userId = :userId', { userId })
        .getCount(),
    ]);

    const dailyVolume = await this.getUserTripDailyVolume(userId, weekStart);

    return {
      nextTrip,
      tripsThisWeek,
      completedTrips,
      totalTrips,
      dailyVolume,
    };
  }

  /**
   * DRIVER SUMMARY
   * Today's assignments + current trip for the signed-in driver.
   */
  async getDriverSummary(userId: UUID): Promise<DriverSummary> {
    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = addDays(dayStart, 1);
    const weekStart = startOfDay(addDays(now, -6));

    const todaysTrips = await this.userTripRepository
      .createQueryBuilder('userTrip')
      .leftJoin('userTrip.trip', 'trip')
      .select([...USER_TRIP_SELECT])
      .addSelect([...TRIP_SELECT])
      .where('userTrip.userId = :userId', { userId })
      .andWhere('userTrip.startTime >= :dayStart', { dayStart })
      .andWhere('userTrip.startTime < :dayEnd', { dayEnd })
      .orderBy('userTrip.startTime', 'ASC')
      .getMany();

    const currentTrip = await this.userTripRepository
      .createQueryBuilder('userTrip')
      .leftJoin('userTrip.trip', 'trip')
      .select([...USER_TRIP_SELECT])
      .addSelect([...TRIP_SELECT])
      .where('userTrip.userId = :userId', { userId })
      .andWhere('userTrip.status = :status', {
        status: UserTripStatus.IN_PROGRESS,
      })
      .orderBy('userTrip.startTime', 'DESC')
      .limit(1)
      .getOne();

    const [completedThisWeek, totalTrips] = await Promise.all([
      this.userTripRepository
        .createQueryBuilder('userTrip')
        .where('userTrip.userId = :userId', { userId })
        .andWhere('userTrip.status = :status', {
          status: UserTripStatus.COMPLETED,
        })
        .andWhere('userTrip.startTime >= :weekStart', { weekStart })
        .getCount(),
      this.userTripRepository
        .createQueryBuilder('userTrip')
        .where('userTrip.userId = :userId', { userId })
        .getCount(),
    ]);

    return {
      todaysTrips,
      currentTrip,
      completedThisWeek,
      totalTrips,
    };
  }

  /**
   * OPERATIONS OVERVIEW
   * Fleet + platform aggregates for admins.
   */
  async getOverview(): Promise<OverviewSummary> {
    const now = new Date();
    const periodStart = startOfDay(addDays(now, -13));

    const [tripsByStatus, userTripsDaily, signupsDaily] = await Promise.all([
      this.tripRepository
        .createQueryBuilder('trip')
        .select('trip.status', 'status')
        .addSelect('COUNT(trip.id)', 'count')
        .groupBy('trip.status')
        .getRawMany<{ status: string; count: string }>(),
      this.userTripRepository
        .createQueryBuilder('userTrip')
        .select(`date_trunc('day', "userTrip"."start_time")`, 'day')
        .addSelect('COUNT(userTrip.id)', 'count')
        .where('"userTrip"."start_time" >= :periodStart', { periodStart })
        .groupBy('day')
        .orderBy('day', 'ASC')
        .getRawMany<{ day: Date; count: string }>(),
      this.userRepository
        .createQueryBuilder('user')
        .select(`date_trunc('day', "user"."created_at")`, 'day')
        .addSelect('COUNT(user.id)', 'count')
        .where('"user"."created_at" >= :periodStart', { periodStart })
        .groupBy('day')
        .orderBy('day', 'ASC')
        .getRawMany<{ day: Date; count: string }>(),
    ]);

    const [totalUsers, incompleteRegistrations, transportCards, activeTrips] =
      await Promise.all([
        this.userRepository.createQueryBuilder('user').getCount(),
        this.userRepository
          .createQueryBuilder('user')
          .where('user.isProfileComplete = :incomplete', { incomplete: false })
          .getCount(),
        this.transportCardRepository.createQueryBuilder('card').getCount(),
        this.tripRepository
          .createQueryBuilder('trip')
          .where('trip.status = :status', { status: 'IN_PROGRESS' })
          .getCount(),
      ]);

    return {
      tripsByStatus: tripsByStatus.map((row) => ({
        status: row.status,
        count: Number(row.count),
      })),
      activeTrips,
      userTripsDaily: userTripsDaily.map((row) => ({
        day: new Date(row.day).toISOString().slice(0, 10),
        count: Number(row.count),
      })),
      signupsDaily: signupsDaily.map((row) => ({
        day: new Date(row.day).toISOString().slice(0, 10),
        count: Number(row.count),
      })),
      totalUsers,
      incompleteRegistrations,
      transportCards,
    };
  }

  private async getUserTripDailyVolume(
    userId: UUID,
    since: Date
  ): Promise<DailyBucket[]> {
    const rows = await this.userTripRepository
      .createQueryBuilder('userTrip')
      .select(`date_trunc('day', "userTrip"."start_time")`, 'day')
      .addSelect('COUNT(userTrip.id)', 'count')
      .where('userTrip.userId = :userId', { userId })
      .andWhere('"userTrip"."start_time" >= :since', {
        since: startOfDay(since),
      })
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany<{ day: Date; count: string }>();

    return rows.map((row) => ({
      day: new Date(row.day).toISOString().slice(0, 10),
      count: Number(row.count),
    }));
  }
}
