import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import {
  formatLocalPhoneNumber,
  validateForgotPassword,
  validateLogin,
  validateResetPassword,
  validateSignUp,
} from '../validations/user.validations';
import { ValidationError } from '../helpers/errors.helper';
import { comparePasswords, hashPassword } from '../helpers/encryptions.helper';
import { RoleTypes } from '../constants/role.constants';
import { UserRoleService } from './userRole.service';
import { RoleService } from './role.service';
import { sendEmail } from '../helpers/emails.helper';
import { renderPasswordResetHtml } from '../emails/renderEmails';

// LOAD ENV
const { JWT_SECRET, CLIENT_APP_URL } = process.env;

const FORGOT_PASSWORD_RESPONSE = {
  message:
    'If an account exists for this email, we sent password reset instructions.',
};

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashResetToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function getPublicAppUrl(): string {
  const base = CLIENT_APP_URL || 'http://localhost:5173';
  return base.replace(/\/$/, '');
}

export class AuthService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleService: UserRoleService;
  private readonly roleService: RoleService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userRoleService = new UserRoleService();
    this.roleService = new RoleService();
  }

  /**
   * SIGNUP
   * @param user
   * @returns
   */
  async signup(user: Partial<User>): Promise<{ user: User; token: string }> {
    // VALIDATE USER
    const { error, value } = validateSignUp(user);

    if (error) {
      throw new ValidationError(error?.message);
    }

    // CHECK IF USER EXISTS
    const userExists = await this.userRepository.findOne({
      where: { email: value.email },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    // HANDLE USER EXISTENCE
    if (userExists) {
      return {
        user: userExists,
        token: jwt.sign({ id: userExists.id }, String(JWT_SECRET)),
      };
    }

    // HASH PASSWORD
    const hashedPassword = await hashPassword(value.password);

    let phoneNumber = value?.phoneNumber;

    if (phoneNumber) {
      phoneNumber = formatLocalPhoneNumber(phoneNumber);
    }

    // CREATE USER
    const newUser = await this.userRepository.save({
      ...value,
      passwordHash: hashedPassword,
      phoneNumber,
    });

    // GET USER ROLES
    const publicUserRoles = await this.roleService.getRolesByNames([
      RoleTypes.USER,
    ]);

    // ASSIGN DEFAULT ROLE
    if (publicUserRoles?.length <= 0) {
      const userRole = await this.roleService.createRole({
        name: RoleTypes.USER,
      });

      await this.userRoleService.createUserRole({
        userId: newUser?.id,
        roleId: userRole?.id,
      });

    } else {
      await Promise.all(
        publicUserRoles.map((role) =>
          this.userRoleService.createUserRole({
            userId: newUser?.id,
            roleId: role?.id,
          })
        )
      );
    }

    // GENERATE JWT TOKEN
    const jwtToken = jwt.sign({ id: newUser.id }, String(JWT_SECRET));

    const createdUser = await this.userRepository.findOne({
      where: { id: newUser?.id },
      relations: {
        userRoles: {
          role: true,
        },
      },
      order: {
        updatedAt: 'DESC',
      }
    });

    return {
      user: createdUser as User,
      token: jwtToken,
    };
  }

  /**
   * LOGIN
   * @param user
   * @returns
   */
  async login(
    user: Partial<User>
  ): Promise<{ user: Partial<User>; token: string }> {
    // VALIDATE USER
    const { error, value } = validateLogin(user);

    if (error) {
      throw new ValidationError(error?.message);
    }

    const userExists = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: value.email })
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .addSelect('user.passwordHash')
      .getOne();

    if (!userExists) {
      throw new ValidationError('Invalid email or password');
    }

    const isPasswordValid = await comparePasswords(
      value.password,
      userExists?.passwordHash || ''
    );

    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password');
    }

    const jwtToken = jwt.sign({ id: userExists.id }, String(JWT_SECRET));

    return {
      user: {
        ...userExists,
        passwordHash: undefined,
      },
      token: jwtToken,
    };
  }

  /**
   * REQUEST PASSWORD RESET — always returns the same public message.
   */
  async requestPasswordReset(
    body: { email?: string }
  ): Promise<{ message: string }> {
    const { error, value } = validateForgotPassword(body);

    if (error) {
      throw new ValidationError(error?.message);
    }

    const user = await this.userRepository.findOne({
      where: { email: value.email },
    });

    if (!user) {
      return FORGOT_PASSWORD_RESPONSE;
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.userRepository.update(
      { id: user.id },
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: expiresAt,
      }
    );

    const resetUrl = `${getPublicAppUrl()}/auth/reset-password?token=${encodeURIComponent(
      rawToken
    )}`;

    const htmlContent = await renderPasswordResetHtml({
      userName: user.name,
      resetUrl,
    });

    await sendEmail({
      toEmail: value.email,
      subject: 'Reset your Basis Transport password',
      htmlContent,
    });

    return FORGOT_PASSWORD_RESPONSE;
  }

  /**
   * RESET PASSWORD with one-time token
   */
  async resetPassword(body: {
    token?: string;
    password?: string;
  }): Promise<{ message: string }> {
    const { error, value } = validateResetPassword(body);

    if (error) {
      throw new ValidationError(error?.message);
    }

    const tokenHash = hashResetToken(value.token);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.passwordResetTokenHash = :hash', { hash: tokenHash })
      .andWhere('user.passwordResetExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new ValidationError('Invalid or expired reset link');
    }

    const newPasswordHash = await hashPassword(value.password);

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        passwordHash: newPasswordHash,
        passwordResetTokenHash: null,
        passwordResetExpires: null,
      } as any)
      .where('id = :id', { id: user.id })
      .execute();

    return { message: 'Your password has been updated. You can sign in now.' };
  }
}
