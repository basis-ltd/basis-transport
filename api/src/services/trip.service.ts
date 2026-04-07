import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { AppDataSource } from '../data-source';
import {
  createTripValidation,
  quickJoinTripValidation,
  updateTripValidation,
} from '../validations/trip.validations';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { LocationService } from './location.service';
import { Location } from '../entities/location.entity';
import { User } from '../entities/user.entity';
import { LogReferenceTypes } from '../constants/logs.constants';
import { generateReferenceId } from '../helpers/string.helper';
import { UUID } from '../types';
import { getPagingData } from '../helpers/pagination.helper';
import { getPagination, Pagination } from '../helpers/pagination.helper';
import { UserTrip } from '../entities/userTrip.entity';
import { UserTripStatus } from '../constants/userTrip.constants';
import { TripStatus } from '../constants/trip.constants';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { hashPassword } from '../helpers/encryptions.helper';
import { generateRandomString } from '../helpers/string.helper';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/userRole.entity';
import { RoleTypes } from '../constants/role.constants';
import { UserStatus } from '../constants/user.constants';
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

interface NearbyTripResult {
  id: UUID;
  referenceId: string;
  status: TripStatus;
  availableCapacity: number;
  locationFrom?: {
    id: UUID;
    name: string;
    address?: unknown;
  };
  locationTo?: {
    id: UUID;
    name: string;
  };
  distanceMeters?: number;
}

export class TripService {
  private readonly tripRepository: Repository<Trip>;
  private readonly locationRepository: Repository<Location>;
  private readonly userRepository: Repository<User>;
  private readonly userTripRepository: Repository<UserTrip>;
  private readonly roleRepository: Repository<Role>;
  private readonly userRoleRepository: Repository<UserRole>;

  constructor() {
    this.tripRepository = AppDataSource.getRepository(Trip);
    this.locationRepository = AppDataSource.getRepository(Location);
    this.userRepository = AppDataSource.getRepository(User);
    this.userTripRepository = AppDataSource.getRepository(UserTrip);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.userRoleRepository = AppDataSource.getRepository(UserRole);
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

  private normalizePhoneNumber(phoneNumber: string): string {
    const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, 'RW');
    if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
      throw new ValidationError('Invalid phone number');
    }

    return parsedPhoneNumber.format('E.164');
  }

  private async ensureUserRole(userId: UUID): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { name: RoleTypes.USER },
    });

    const userRole =
      role ||
      (await this.roleRepository.save({
        name: RoleTypes.USER,
      }));

    const existingUserRole = await this.userRoleRepository.findOne({
      where: {
        userId,
        roleId: userRole.id,
      },
    });

    if (!existingUserRole) {
      await this.userRoleRepository.save({
        userId,
        roleId: userRole.id,
      });
    }
  }

  private haversineDistanceMeters(
    latitudeA: number,
    longitudeA: number,
    latitudeB: number,
    longitudeB: number
  ): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const earthRadius = 6371000;
    const latDiff = toRadians(latitudeB - latitudeA);
    const lonDiff = toRadians(longitudeB - longitudeA);

    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(toRadians(latitudeA)) *
        Math.cos(toRadians(latitudeB)) *
        Math.sin(lonDiff / 2) *
        Math.sin(lonDiff / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  /**
   * FETCH NEARBY TRIPS
   */
  async fetchNearbyTrips({
    lat,
    lng,
    limit = 5,
  }: {
    lat?: number;
    lng?: number;
    limit?: number;
  }): Promise<NearbyTripResult[]> {
    const candidateTrips = await this.tripRepository.find({
      where: {
        status: In([TripStatus.PENDING, TripStatus.IN_PROGRESS]),
      },
      relations: {
        locationFrom: true,
        locationTo: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (candidateTrips.length === 0) {
      return [];
    }

    const inProgressCountsRaw = await this.userTripRepository
      .createQueryBuilder('userTrip')
      .select('userTrip.tripId', 'tripId')
      .addSelect('COUNT(userTrip.id)', 'inProgressCount')
      .where('userTrip.status = :status', { status: UserTripStatus.IN_PROGRESS })
      .groupBy('userTrip.tripId')
      .getRawMany<{ tripId: UUID; inProgressCount: string }>();

    const inProgressCountByTrip = new Map<UUID, number>(
      inProgressCountsRaw.map((item) => [item.tripId, Number(item.inProgressCount)])
    );

    const mapTripToResult = (
      trip: Trip,
      distanceMeters?: number
    ): NearbyTripResult => ({
      id: trip.id as UUID,
      referenceId: trip.referenceId,
      status: trip.status,
      availableCapacity:
        (trip.totalCapacity ?? 0) - (inProgressCountByTrip.get(trip.id as UUID) ?? 0),
      locationFrom: trip.locationFrom
        ? {
            id: trip.locationFrom.id as UUID,
            name: trip.locationFrom.name,
            address: trip.locationFrom.address,
          }
        : undefined,
      locationTo: trip.locationTo
        ? {
            id: trip.locationTo.id as UUID,
            name: trip.locationTo.name,
          }
        : undefined,
      distanceMeters,
    });

    const canSortByDistance =
      Number.isFinite(lat) && Number.isFinite(lng) && lat !== undefined && lng !== undefined;

    if (!canSortByDistance) {
      return candidateTrips.slice(0, limit).map((trip) => mapTripToResult(trip));
    }

    const tripById = new Map<UUID, Trip>(
      candidateTrips.map((trip) => [trip.id as UUID, trip])
    );

    try {
      const rawDistances = await this.tripRepository
        .createQueryBuilder('trip')
        .leftJoin('trip.locationFrom', 'locationFrom')
        .select('trip.id', 'tripId')
        .addSelect(
          'ST_Distance(locationFrom.address::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)',
          'distanceMeters'
        )
        .where('trip.status IN (:...statuses)', {
          statuses: [TripStatus.PENDING, TripStatus.IN_PROGRESS],
        })
        .andWhere('locationFrom.address IS NOT NULL')
        .setParameters({
          lat,
          lng,
        })
        .orderBy('distanceMeters', 'ASC')
        .getRawMany<{ tripId: UUID; distanceMeters: string }>();

      const withDistances = rawDistances
        .map((entry) => {
          const trip = tripById.get(entry.tripId);
          if (!trip) {
            return null;
          }
          return mapTripToResult(trip, Number(entry.distanceMeters));
        })
        .filter((trip): trip is NearbyTripResult => Boolean(trip));

      const seenIds = new Set(withDistances.map((trip) => trip.id));
      const withoutLocation = candidateTrips
        .filter((trip) => !seenIds.has(trip.id as UUID))
        .map((trip) => mapTripToResult(trip));

      return [...withDistances, ...withoutLocation].slice(0, limit);
    } catch {
      const sortedByDistance = candidateTrips
        .map((trip) => {
          const coordinates = (trip.locationFrom?.address as { coordinates?: number[] })
            ?.coordinates;
          if (!coordinates || coordinates.length < 2) {
            return mapTripToResult(trip, Number.POSITIVE_INFINITY);
          }

          const [tripLatitude, tripLongitude] = coordinates;
          return mapTripToResult(
            trip,
            this.haversineDistanceMeters(lat, lng, tripLatitude, tripLongitude)
          );
        })
        .sort(
          (tripA, tripB) =>
            (tripA.distanceMeters ?? Number.POSITIVE_INFINITY) -
            (tripB.distanceMeters ?? Number.POSITIVE_INFINITY)
        );

      return sortedByDistance.slice(0, limit);
    }
  }

  /**
   * QUICK JOIN TRIP
   */
  async quickJoinTrip({
    tripId,
    phoneNumber,
    entranceLocation,
  }: {
    tripId: UUID;
    phoneNumber: string;
    entranceLocation: {
      type: string;
      coordinates: number[];
    };
  }) {
    const { error } = quickJoinTripValidation({
      phoneNumber,
      entranceLocation,
    });

    if (error) {
      throw new ValidationError(error.message);
    }

    const formattedPhoneNumber = this.normalizePhoneNumber(phoneNumber);

    const trip = await this.tripRepository.findOne({
      where: { id: tripId as UUID },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found', {
        referenceId: tripId,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    if (![TripStatus.PENDING, TripStatus.IN_PROGRESS].includes(trip.status)) {
      throw new ValidationError('Trip is not available for joining', {
        referenceId: tripId,
        referenceType: LogReferenceTypes.TRIP,
      });
    }

    let user = await this.userRepository.findOne({
      where: { phoneNumber: formattedPhoneNumber },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      const randomPasswordHash = await hashPassword(generateRandomString(16));
      try {
        user = await this.userRepository.save({
          phoneNumber: formattedPhoneNumber,
          passwordHash: randomPasswordHash,
          status: UserStatus.ACTIVE,
          isProfileComplete: false,
        });
      } catch (error) {
        const dbError = error as { code?: string };
        if (dbError?.code === '23505') {
          user = await this.userRepository.findOne({
            where: { phoneNumber: formattedPhoneNumber },
            relations: {
              userRoles: {
                role: true,
              },
            },
          });
        } else {
          throw error;
        }
      }

      if (!user) {
        throw new ValidationError('Unable to create or load user account');
      }
    }

    await this.ensureUserRole(user.id as UUID);

    const userTrip = await this.userTripRepository.findOne({
      where: { userId: user.id as UUID, tripId: trip.id as UUID },
    });

    const userTripPayload: Partial<UserTrip> = {
      userId: user.id as UUID,
      tripId: trip.id as UUID,
      entranceLocation: entranceLocation as unknown as UserTrip['entranceLocation'],
      startTime: new Date(),
      status: UserTripStatus.IN_PROGRESS,
      exitLocation: null as unknown as UserTrip['exitLocation'],
      endTime: null as unknown as UserTrip['endTime'],
    };

    if (userTrip?.id) {
      userTripPayload.id = userTrip.id;
    }

    const savedUserTrip = await this.userTripRepository.save(userTripPayload);

    const resolvedUser = await this.userRepository.findOne({
      where: { id: user.id as UUID },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    return {
      user: resolvedUser,
      token: jwt.sign({ id: user.id }, String(JWT_SECRET)),
      userTrip: savedUserTrip,
    };
  }
}
