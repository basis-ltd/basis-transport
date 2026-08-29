import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { AuthenticatedUser } from '../types/auth.types';
import { UUID } from '../../types';
import { setAuditUserId } from '../middleware/request-context.store';
import {
  IS_OPTIONAL_AUTH_KEY,
  IS_PUBLIC_KEY,
  ROLES_KEY,
  SKIP_REGISTRATION_CHECK_KEY,
} from '../decorators/auth.decorators';
import { hasAnyRole } from '../../helpers/auth.helper';
import { RoleTypes } from '../../constants/role.constants';

interface JwtIdPayload {
  id: UUID;
  mustCompleteRegistration?: boolean;
}

async function loadAuthenticatedUser(
  userRepository: Repository<User>,
  userId: UUID
): Promise<AuthenticatedUser | null> {
  const dbUser = await userRepository.findOne({
    where: { id: userId },
    relations: {
      userRoles: {
        role: true,
      },
    },
  });

  if (!dbUser) {
    return null;
  }

  const roleNames =
    dbUser.userRoles
      ?.map((ur) => ur.role?.name)
      .filter((n): n is string => Boolean(n)) ?? [];

  return {
    id: dbUser.id,
    email: dbUser.email ?? undefined,
    phoneNumber: dbUser.phoneNumber ?? undefined,
    mustCompleteRegistration: !dbUser.isProfileComplete,
    roleNames,
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()]
    );

    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.split(' ')[1];

    if (!token) {
      if (isOptionalAuth) {
        return true;
      }
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(
        token,
        this.configService.get<string>('jwt.secret') as string
      ) as JwtIdPayload;

      if (!decoded?.id) {
        if (isOptionalAuth) {
          return true;
        }
        throw new UnauthorizedException({ message: 'Invalid token' });
      }

      const user = await loadAuthenticatedUser(this.userRepository, decoded.id);
      if (!user) {
        if (isOptionalAuth) {
          return true;
        }
        throw new UnauthorizedException({ message: 'Unauthorized' });
      }

      const skipRegistrationCheck = this.reflector.getAllAndOverride<boolean>(
        SKIP_REGISTRATION_CHECK_KEY,
        [context.getHandler(), context.getClass()]
      );

      const mustCompleteRegistration =
        Boolean(decoded.mustCompleteRegistration) ||
        Boolean(user.mustCompleteRegistration);

      if (mustCompleteRegistration && !skipRegistrationCheck) {
        throw new ForbiddenException({
          message: 'Complete your registration to continue',
          data: { mustCompleteRegistration: true },
        });
      }

      request.user = user;
      setAuditUserId(user.id);
      return true;
    } catch (error) {
      if (isOptionalAuth) {
        return true;
      }
      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleTypes[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!hasAnyRole(user, ...requiredRoles)) {
      throw new ForbiddenException({
        message: 'Insufficient permissions to perform this action',
      });
    }

    return true;
  }
}
