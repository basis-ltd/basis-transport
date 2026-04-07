import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { AuthenticatedRequest, AuthenticatedUser } from '../types/auth.types';
import { UUID } from '../types';
import { setAuditUserId } from './requestContext.middleware';

interface JwtIdPayload {
  id: UUID;
  mustCompleteRegistration?: boolean;
}

async function loadAuthenticatedUser(userId: UUID): Promise<AuthenticatedUser | null> {
  const userRepository = AppDataSource.getRepository(User);
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

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers?.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtIdPayload;

    if (!decoded?.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await loadAuthenticatedUser(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isCompletingRegistrationRoute =
      req.baseUrl.endsWith('/auth') && req.path === '/complete-registration';
    const mustCompleteRegistration =
      Boolean(decoded.mustCompleteRegistration) || Boolean(user.mustCompleteRegistration);

    if (mustCompleteRegistration && !isCompletingRegistrationRoute) {
      return res.status(403).json({
        message: 'Complete your registration to continue',
        data: { mustCompleteRegistration: true },
      });
    }

    (req as AuthenticatedRequest).user = user;
    setAuditUserId(user.id);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req?.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtIdPayload;

    if (!decoded?.id) {
      return next();
    }

    const user = await loadAuthenticatedUser(decoded.id);
    if (user) {
      (req as AuthenticatedRequest).user = user;
      setAuditUserId(user.id);
    }
    next();
  } catch {
    next();
  }
};
