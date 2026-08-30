jest.mock('../../emails/renderEmails', () => ({
  renderPasswordResetHtml: jest.fn().mockResolvedValue('<html></html>'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRoleService } from './user-role.service';
import { RolesService } from '../roles/roles.service';
import { EmailService } from '../../integrations/email/email.service';
import { SMSService } from '../../integrations/sms/sms.service';
import { User } from '../../entities/user.entity';
import { ValidationError } from '../../helpers/errors.helper';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: UserRoleService,
          useValue: { createUserRole: jest.fn() },
        },
        {
          provide: RolesService,
          useValue: { getRolesByNames: jest.fn(), createRole: jest.fn() },
        },
        {
          provide: SMSService,
          useValue: { send: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt.secret') return 'test-secret';
              if (key === 'clientAppUrl') return 'http://localhost:5173';
              return undefined;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(() => 'token') },
        },
        {
          provide: EmailService,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('login throws ValidationError when user is not found', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    mockUserRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(
      authService.login({
        username: 'missing@example.com',
        password: 'Test@1234',
      })
    ).rejects.toThrow(ValidationError);
  });
});
