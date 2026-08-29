import { createHash, randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import {
  UnauthorizedError,
  ValidationError,
} from '../../helpers/errors.helper';
import {
  comparePasswords,
  hashPassword,
} from '../../helpers/encryptions.helper';
import { RoleTypes } from '../../constants/role.constants';
import { UserRoleService } from './user-role.service';
import { RolesService } from '../roles/roles.service';
import { EmailService } from '../../integrations/email/email.service';
import { renderPasswordResetHtml } from '../../emails/renderEmails';
import { SMSService } from '../../integrations/sms/sms.service';
import {
  buildPhoneOtpMessage,
  buildPhonePasswordResetOtpMessage,
} from '../../integrations/sms/sms.messages';
import { UUID } from '../../types';
import { AppConfig } from '../../config/config.types';
import { formatLocalPhoneNumber } from '../../common/utils/phone.util';

const FORGOT_PASSWORD_RESPONSE = {
  message:
    'If an account exists for this email, we sent password reset instructions.',
};

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const PHONE_OTP_TTL_MS = 10 * 60 * 1000;
const PHONE_OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const PHONE_OTP_MAX_ATTEMPTS = 5;
const PHONE_RESET_OTP_TTL_MS = 10 * 60 * 1000;
const PHONE_RESET_OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const PHONE_RESET_OTP_MAX_ATTEMPTS = 5;
const TEMP_AUTH_TTL_MS = 15 * 60 * 1000;

function hashResetToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userRoleService: UserRoleService,
    private readonly roleService: RolesService,
    private readonly smsService: SMSService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  /**
   * SIGNUP
   * @param user
   * @returns
   */
  async signup(
    user: Partial<User> & { password?: string }
  ): Promise<{ user: User; token: string }> {
    const normalizedEmail = user.email
      ? user.email.toLowerCase().trim()
      : undefined;

    // CHECK IF USER EXISTS
    const userExists = normalizedEmail
      ? await this.userRepository.findOne({
          where: { email: normalizedEmail },
          relations: {
            userRoles: {
              role: true,
            },
          },
        })
      : null;

    // HANDLE USER EXISTENCE
    if (userExists) {
      return {
        user: userExists,
        token: this.jwtService.sign({ id: userExists.id }),
      };
    }

    // HASH PASSWORD
    const hashedPassword = await hashPassword(user.password as string);

    let phoneNumber = user?.phoneNumber;

    if (phoneNumber) {
      phoneNumber = formatLocalPhoneNumber(phoneNumber);
    }

    // CREATE USER
    const newUser = await this.userRepository.save({
      ...user,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      phoneNumber,
      hasSetPassword: true,
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
    const jwtToken = this.jwtService.sign({ id: newUser.id });

    const createdUser = await this.userRepository.findOne({
      where: { id: newUser?.id },
      relations: {
        userRoles: {
          role: true,
        },
      },
      order: {
        updatedAt: 'DESC',
      },
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
    user: Partial<User> & { username?: string; password?: string }
  ): Promise<{ user: Partial<User>; token: string }> {
    const username = String(user.username || '').trim();
    const normalizedEmail = username.toLowerCase();
    const normalizedPhone = this.tryNormalizePhoneNumber(username);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .addSelect('user.passwordHash');

    if (normalizedPhone) {
      queryBuilder
        .where('LOWER(user.email) = :email', { email: normalizedEmail })
        .orWhere('user.phone_number = :phoneNumber', {
          phoneNumber: normalizedPhone,
        });
    } else {
      queryBuilder.where('LOWER(user.email) = :email', {
        email: normalizedEmail,
      });
    }

    const userExists = await queryBuilder.getOne();

    if (!userExists) {
      throw new ValidationError('Invalid username or password');
    }

    if (!userExists.hasSetPassword) {
      throw new ValidationError(
        'This account does not have a password yet. Continue with phone verification.'
      );
    }

    const isPasswordValid = await comparePasswords(
      user.password as string,
      userExists?.passwordHash || ''
    );

    if (!isPasswordValid) {
      throw new ValidationError('Invalid username or password');
    }

    const jwtToken = this.signAuthToken(userExists.id);

    return {
      user: {
        ...userExists,
        passwordHash: undefined,
        mustCompleteRegistration: !userExists.isProfileComplete,
      },
      token: jwtToken,
    };
  }

  /**
   * PHONE LOGIN PRECHECK
   */
  async phoneLoginPrecheck(body: { phoneNumber?: string }): Promise<{
    hasPassword: boolean;
  }> {
    const phoneNumber = formatLocalPhoneNumber(body.phoneNumber as string);
    const user = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (!user) {
      throw new ValidationError('Invalid phone number or password');
    }

    return {
      hasPassword: Boolean(user.hasSetPassword),
    };
  }

  /**
   * SEND PHONE OTP
   */
  async sendPhoneOtp(body: { phoneNumber?: string }): Promise<{
    otpSent: boolean;
    cooldownSeconds: number;
  }> {
    const phoneNumber = formatLocalPhoneNumber(body.phoneNumber as string);
    const user = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (!user) {
      throw new ValidationError('Unable to send verification code');
    }

    if (user.hasSetPassword) {
      throw new ValidationError(
        'This account already has a password. Use phone + password login.'
      );
    }

    const now = Date.now();
    const lastSentAt = user.phoneOtpLastSentAt?.getTime();
    if (lastSentAt && now - lastSentAt < PHONE_OTP_RESEND_COOLDOWN_MS) {
      throw new ValidationError(
        'Please wait before requesting another verification code.'
      );
    }

    const otp = this.generatePhoneOtp();
    const otpHash = this.hashOtp(otp);
    const otpExpiresAt = new Date(now + PHONE_OTP_TTL_MS);

    await this.userRepository.update(
      { id: user.id },
      {
        phoneOtpHash: otpHash,
        phoneOtpExpiresAt: otpExpiresAt,
        phoneOtpAttempts: 0,
        phoneOtpLastSentAt: new Date(now),
      }
    );

    const smsResult = await this.smsService.send({
      to: phoneNumber,
      text: buildPhoneOtpMessage(otp),
    });

    if (!smsResult) {
      throw new ValidationError(
        'Unable to send verification code. Please try again.'
      );
    }

    return {
      otpSent: true,
      cooldownSeconds: Math.floor(PHONE_OTP_RESEND_COOLDOWN_MS / 1000),
    };
  }

  /**
   * VERIFY PHONE OTP
   */
  async verifyPhoneOtp(body: { phoneNumber?: string; otp?: string }): Promise<{
    user: Partial<User>;
    token: string;
    mustCompleteRegistration: true;
  }> {
    const phoneNumber = formatLocalPhoneNumber(body.phoneNumber as string);
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.phone_number = :phoneNumber', { phoneNumber })
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .addSelect('user.phoneOtpHash')
      .getOne();

    if (!user || user.hasSetPassword) {
      throw new ValidationError('Invalid or expired verification code');
    }

    const now = Date.now();
    if (
      !user.phoneOtpHash ||
      !user.phoneOtpExpiresAt ||
      user.phoneOtpExpiresAt.getTime() < now
    ) {
      throw new ValidationError('Invalid or expired verification code');
    }

    if (user.phoneOtpAttempts >= PHONE_OTP_MAX_ATTEMPTS) {
      throw new ValidationError(
        'Maximum OTP attempts reached. Request a new code.'
      );
    }

    const otpHash = this.hashOtp(body.otp as string);
    if (otpHash !== user.phoneOtpHash) {
      const nextAttempts = user.phoneOtpAttempts + 1;
      await this.userRepository.update(
        { id: user.id },
        {
          phoneOtpAttempts: nextAttempts,
          ...(nextAttempts >= PHONE_OTP_MAX_ATTEMPTS
            ? {
                phoneOtpHash: null,
                phoneOtpExpiresAt: null,
                phoneOtpLastSentAt: null,
              }
            : {}),
        }
      );
      throw new ValidationError('Invalid or expired verification code');
    }

    const temporaryAuthExpiresAt = new Date(now + TEMP_AUTH_TTL_MS);
    await this.userRepository.update(
      { id: user.id },
      {
        phoneOtpHash: null,
        phoneOtpExpiresAt: null,
        phoneOtpAttempts: 0,
        temporaryAuthExpiresAt,
        isProfileComplete: false,
      }
    );

    const refreshedUser = await this.findUserWithRoles(user.id);
    const token = this.signAuthToken(user.id, true);

    return {
      user: {
        ...(refreshedUser as User),
        passwordHash: undefined,
        mustCompleteRegistration: true,
      },
      token,
      mustCompleteRegistration: true,
    };
  }

  /**
   * SEND PHONE RESET OTP
   */
  async sendPhoneResetOtp(body: { phoneNumber?: string }): Promise<{
    otpSent: boolean;
    cooldownSeconds: number;
  }> {
    const phoneNumber = formatLocalPhoneNumber(body.phoneNumber as string);
    const user = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    // Keep this endpoint non-enumerable: return a generic success response.
    if (!user || !user.hasSetPassword) {
      return {
        otpSent: true,
        cooldownSeconds: Math.floor(PHONE_RESET_OTP_RESEND_COOLDOWN_MS / 1000),
      };
    }

    const now = Date.now();
    const lastSentAt = user.phoneResetOtpLastSentAt?.getTime();
    if (lastSentAt && now - lastSentAt < PHONE_RESET_OTP_RESEND_COOLDOWN_MS) {
      throw new ValidationError(
        'Please wait before requesting another reset code.'
      );
    }

    const otp = this.generatePhoneOtp();
    const otpHash = this.hashOtp(otp);
    const otpExpiresAt = new Date(now + PHONE_RESET_OTP_TTL_MS);

    await this.userRepository.update(
      { id: user.id },
      {
        phoneResetOtpHash: otpHash,
        phoneResetOtpExpiresAt: otpExpiresAt,
        phoneResetOtpAttempts: 0,
        phoneResetOtpLastSentAt: new Date(now),
        phoneResetSessionHash: null,
        phoneResetSessionExpiresAt: null,
      }
    );

    const smsResult = await this.smsService.send({
      to: phoneNumber,
      text: buildPhonePasswordResetOtpMessage(otp),
    });

    if (!smsResult) {
      throw new ValidationError('Unable to send reset code. Please try again.');
    }

    return {
      otpSent: true,
      cooldownSeconds: Math.floor(PHONE_RESET_OTP_RESEND_COOLDOWN_MS / 1000),
    };
  }

  /**
   * VERIFY PHONE RESET OTP
   */
  async verifyPhoneResetOtp(body: {
    phoneNumber?: string;
    otp?: string;
  }): Promise<{
    token: string;
    expiresInSeconds: number;
  }> {
    const phoneNumber = formatLocalPhoneNumber(body.phoneNumber as string);
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.phone_number = :phoneNumber', { phoneNumber })
      .addSelect('user.phoneResetOtpHash')
      .getOne();

    if (!user || !user.hasSetPassword) {
      throw new ValidationError('Invalid or expired reset code');
    }

    const now = Date.now();
    if (
      !user.phoneResetOtpHash ||
      !user.phoneResetOtpExpiresAt ||
      user.phoneResetOtpExpiresAt.getTime() < now
    ) {
      throw new ValidationError('Invalid or expired reset code');
    }

    if (user.phoneResetOtpAttempts >= PHONE_RESET_OTP_MAX_ATTEMPTS) {
      throw new ValidationError(
        'Maximum OTP attempts reached. Request a new code.'
      );
    }

    const otpHash = this.hashOtp(body.otp as string);
    if (otpHash !== user.phoneResetOtpHash) {
      const nextAttempts = user.phoneResetOtpAttempts + 1;
      await this.userRepository.update(
        { id: user.id },
        {
          phoneResetOtpAttempts: nextAttempts,
          ...(nextAttempts >= PHONE_RESET_OTP_MAX_ATTEMPTS
            ? {
                phoneResetOtpHash: null,
                phoneResetOtpExpiresAt: null,
                phoneResetOtpLastSentAt: null,
              }
            : {}),
        }
      );
      throw new ValidationError('Invalid or expired reset code');
    }

    const rawResetToken = randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawResetToken);
    const resetExpiresAt = new Date(now + RESET_TOKEN_TTL_MS);

    await this.userRepository.update(
      { id: user.id },
      {
        phoneResetOtpHash: null,
        phoneResetOtpExpiresAt: null,
        phoneResetOtpAttempts: 0,
        phoneResetOtpLastSentAt: null,
        phoneResetSessionHash: null,
        phoneResetSessionExpiresAt: null,
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: resetExpiresAt,
      }
    );

    return {
      token: rawResetToken,
      expiresInSeconds: Math.floor(RESET_TOKEN_TTL_MS / 1000),
    };
  }

  /**
   * COMPLETE REGISTRATION
   */
  async completeRegistration(
    body: { email?: string; password?: string },
    userId: UUID
  ): Promise<{ user: User; token: string }> {
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Unauthorized');
    }

    if (
      !user.temporaryAuthExpiresAt ||
      user.temporaryAuthExpiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedError(
        'Your verification session has expired. Please login again.'
      );
    }

    const normalizedEmail = body.email
      ? body.email.toLowerCase().trim()
      : undefined;

    if (normalizedEmail) {
      const emailOwner = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });

      if (emailOwner && emailOwner.id !== user.id) {
        throw new ValidationError('Email is already in use');
      }
    }

    const passwordHash = await hashPassword(body.password as string);

    await this.userRepository.update(
      { id: user.id },
      {
        passwordHash,
        hasSetPassword: true,
        email: normalizedEmail,
        isProfileComplete: true,
        temporaryAuthExpiresAt: null,
      }
    );

    const updatedUser = await this.findUserWithRoles(user.id);
    const token = this.signAuthToken(user.id);

    return {
      user: updatedUser as User,
      token,
    };
  }

  /**
   * REQUEST PASSWORD RESET — always returns the same public message.
   */
  async requestPasswordReset(body: {
    email?: string;
  }): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: body.email },
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

    const resetUrl = `${this.getPublicAppUrl()}/auth/reset-password?token=${encodeURIComponent(
      rawToken
    )}`;

    const htmlContent = await renderPasswordResetHtml({
      userName: user.name,
      resetUrl,
    });

    await this.emailService.send({
      to: body.email as string,
      subject: 'Reset your Basis Transport password',
      html: htmlContent,
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
    const tokenHash = hashResetToken(body.token as string);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.passwordResetTokenHash = :hash', { hash: tokenHash })
      .andWhere('user.passwordResetExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new ValidationError('Invalid or expired reset link');
    }

    const newPasswordHash = await hashPassword(body.password as string);

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        passwordHash: newPasswordHash,
        hasSetPassword: true,
        passwordResetTokenHash: null,
        passwordResetExpires: null,
        phoneResetOtpHash: null,
        phoneResetOtpExpiresAt: null,
        phoneResetOtpAttempts: 0,
        phoneResetOtpLastSentAt: null,
        phoneResetSessionHash: null,
        phoneResetSessionExpiresAt: null,
      } as any)
      .where('id = :id', { id: user.id })
      .execute();

    return { message: 'Your password has been updated. You can sign in now.' };
  }

  private signAuthToken(
    userId: User['id'],
    mustCompleteRegistration: boolean = false
  ): string {
    return this.jwtService.sign({
      id: userId,
      mustCompleteRegistration,
    });
  }

  private getPublicAppUrl(): string {
    return this.config.get('clientAppUrl', { infer: true }).replace(/\/$/, '');
  }

  private async findUserWithRoles(userId: User['id']): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: {
        userRoles: {
          role: true,
        },
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  private tryNormalizePhoneNumber(value: string): string | null {
    try {
      return formatLocalPhoneNumber(value);
    } catch {
      return null;
    }
  }

  private generatePhoneOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private hashOtp(otp: string): string {
    return createHash('sha256').update(otp, 'utf8').digest('hex');
  }
}
