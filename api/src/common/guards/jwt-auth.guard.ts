import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '../types/auth.types';
import { RoleTypes } from '../../constants/role.constants';
import { setAuditUserId } from '../middleware/request-context.store';
import {
  IS_OPTIONAL_AUTH_KEY,
  IS_PUBLIC_KEY,
  ROLES_KEY,
  SKIP_REGISTRATION_CHECK_KEY,
} from '../decorators/auth.decorators';
import { hasAnyRole } from '../../helpers/auth.helper';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = AuthenticatedUser>(
    err: Error | null,
    user: TUser | false,
    _info: unknown,
    context: ExecutionContext
  ): TUser {
    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!user) {
      if (isOptionalAuth) {
        return undefined as TUser;
      }
      if (err) {
        throw err;
      }
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }

    const authenticatedUser = user as unknown as AuthenticatedUser;
    const skipRegistrationCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_REGISTRATION_CHECK_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (authenticatedUser.mustCompleteRegistration && !skipRegistrationCheck) {
      throw new ForbiddenException({
        message: 'Complete your registration to continue',
        data: { mustCompleteRegistration: true },
      });
    }

    const request = context.switchToHttp().getRequest();
    request.user = authenticatedUser;
    setAuditUserId(authenticatedUser.id);

    return user;
  }
}

@Injectable()
export class RolesGuard {
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
