import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AppConfig } from '../../../config/config.types';
import { User } from '../../../entities/user.entity';
import { AuthenticatedUser } from '../../../common/types/auth.types';
import { UUID } from '../../../types';

export interface JwtIdPayload {
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
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<AppConfig, true>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('jwt.secret', { infer: true }),
    });
  }

  async validate(payload: JwtIdPayload): Promise<AuthenticatedUser> {
    if (!payload?.id) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }

    const user = await loadAuthenticatedUser(this.userRepository, payload.id);
    if (!user) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }

    return {
      ...user,
      mustCompleteRegistration:
        Boolean(payload.mustCompleteRegistration) ||
        Boolean(user.mustCompleteRegistration),
    };
  }
}
