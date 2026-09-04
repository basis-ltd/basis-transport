import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { Trip } from '../../entities/trip.entity';
import { UserTrip } from '../../entities/userTrip.entity';
import { User } from '../../entities/user.entity';
import { TransportCard } from '../../entities/transportCard.entity';
import { UserTripStatus } from '../../constants/userTrip.constants';

function chainable(overrides: Record<string, unknown> = {}) {
  const qb: Record<string, jest.Mock> = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
    getMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(0),
    getRawMany: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
  return qb;
}

describe('DashboardService', () => {
  let service: DashboardService;

  const mockUserTripRepository = { createQueryBuilder: jest.fn() };
  const mockTripRepository = { createQueryBuilder: jest.fn() };
  const mockUserRepository = { createQueryBuilder: jest.fn() };
  const mockTransportCardRepository = { createQueryBuilder: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(UserTrip),
          useValue: mockUserTripRepository,
        },
        { provide: getRepositoryToken(Trip), useValue: mockTripRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(TransportCard),
          useValue: mockTransportCardRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('getCommuterSummary', () => {
    it('returns next trip, counts, and daily volume for the user', async () => {
      const nextTrip = {
        id: 'ut-1',
        status: UserTripStatus.IN_PROGRESS,
        startTime: new Date(),
      };
      mockUserTripRepository.createQueryBuilder
        .mockReturnValueOnce(chainable({ getOne: jest.fn().mockResolvedValue(nextTrip) }))
        .mockReturnValueOnce(chainable({ getCount: jest.fn().mockResolvedValue(3) }))
        .mockReturnValueOnce(chainable({ getCount: jest.fn().mockResolvedValue(5) }))
        .mockReturnValueOnce(chainable({ getCount: jest.fn().mockResolvedValue(8) }))
        .mockReturnValueOnce(
          chainable({
            getRawMany: jest
              .fn()
              .mockResolvedValue([{ day: new Date('2026-09-01T00:00:00Z'), count: '2' }]),
          })
        );

      const result = await service.getCommuterSummary('user-1' as never);

      expect(result.nextTrip).toEqual(nextTrip);
      expect(result.tripsThisWeek).toBe(3);
      expect(result.completedTrips).toBe(5);
      expect(result.totalTrips).toBe(8);
      expect(result.dailyVolume).toEqual([{ day: '2026-09-01', count: 2 }]);
    });

    it('returns null next trip when the user has nothing upcoming', async () => {
      mockUserTripRepository.createQueryBuilder.mockReturnValue(
        chainable()
      );

      const result = await service.getCommuterSummary('user-1' as never);

      expect(result.nextTrip).toBeNull();
      expect(result.totalTrips).toBe(0);
      expect(result.dailyVolume).toEqual([]);
    });
  });

  describe('getDriverSummary', () => {
    it('returns today assignments, current trip, and week count', async () => {
      const todaysTrips = [{ id: 'ut-1' }, { id: 'ut-2' }];
      const currentTrip = { id: 'ut-1', status: UserTripStatus.IN_PROGRESS };
      mockUserTripRepository.createQueryBuilder
        .mockReturnValueOnce(chainable({ getMany: jest.fn().mockResolvedValue(todaysTrips) }))
        .mockReturnValueOnce(chainable({ getOne: jest.fn().mockResolvedValue(currentTrip) }))
        .mockReturnValueOnce(chainable({ getCount: jest.fn().mockResolvedValue(4) }))
        .mockReturnValueOnce(chainable({ getCount: jest.fn().mockResolvedValue(10) }));

      const result = await service.getDriverSummary('driver-1' as never);

      expect(result.todaysTrips).toEqual(todaysTrips);
      expect(result.currentTrip).toEqual(currentTrip);
      expect(result.completedThisWeek).toBe(4);
      expect(result.totalTrips).toBe(10);
    });
  });

  describe('getOverview', () => {
    it('maps raw aggregate rows to typed numbers and ISO days', async () => {
      mockTripRepository.createQueryBuilder
        .mockReturnValueOnce(
          chainable({
            getRawMany: jest.fn().mockResolvedValue([
              { status: 'IN_PROGRESS', count: '3' },
              { status: 'COMPLETED', count: '12' },
            ]),
          })
        )
        .mockReturnValueOnce(chainable({ getCount: jest.fn().mockResolvedValue(3) }));
      mockUserTripRepository.createQueryBuilder.mockReturnValueOnce(
        chainable({
          getRawMany: jest
            .fn()
            .mockResolvedValue([{ day: new Date('2026-09-02T00:00:00Z'), count: '7' }]),
        })
      );
      mockUserRepository.createQueryBuilder
        .mockReturnValueOnce(
          chainable({
            getRawMany: jest
              .fn()
              .mockResolvedValue([{ day: new Date('2026-09-02T00:00:00Z'), count: '1' }]),
          })
        )
        .mockReturnValueOnce(chainable({ getCount: jest.fn().mockResolvedValue(100) }))
        .mockReturnValueOnce(chainable({ getCount: jest.fn().mockResolvedValue(9) }));
      mockTransportCardRepository.createQueryBuilder.mockReturnValueOnce(
        chainable({ getCount: jest.fn().mockResolvedValue(42) })
      );

      const result = await service.getOverview();

      expect(result.tripsByStatus).toEqual([
        { status: 'IN_PROGRESS', count: 3 },
        { status: 'COMPLETED', count: 12 },
      ]);
      expect(result.activeTrips).toBe(3);
      expect(result.userTripsDaily).toEqual([{ day: '2026-09-02', count: 7 }]);
      expect(result.signupsDaily).toEqual([{ day: '2026-09-02', count: 1 }]);
      expect(result.totalUsers).toBe(100);
      expect(result.incompleteRegistrations).toBe(9);
      expect(result.transportCards).toBe(42);
    });
  });
});
