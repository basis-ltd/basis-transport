import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { AuthenticatedUser } from '../types/auth.types';
import { RoleTypes } from '../../constants/role.constants';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RoleTypes[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth';
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);

export const SKIP_REGISTRATION_CHECK_KEY = 'skipRegistrationCheck';
export const SkipRegistrationCheck = () =>
  SetMetadata(SKIP_REGISTRATION_CHECK_KEY, true);
