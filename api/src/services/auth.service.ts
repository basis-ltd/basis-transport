import { createHash, randomBytes } from 'crypto';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import {
  validateCompleteRegistration,
  formatLocalPhoneNumber,
  validateForgotPassword,
  validateLogin,
  validatePhoneLoginPrecheck,
  validatePhoneResetPassword,
  validateResetPassword,
  validateSendPhoneResetOtp,
  validateSendPhoneOtp,
  validateSignUp,
  validateVerifyPhoneResetOtp,
  validateVerifyPhoneOtp,
} from '../validations/user.validations';
import { UnauthorizedError, ValidationError } from '../helpers/errors.helper';
import { comparePasswords, hashPassword } from '../helpers/encryptions.helper';
import { RoleTypes } from '../constants/role.constants';
import { UserRoleService } from './userRole.service';
import { RoleService } from './role.service';
import { sendEmail } from '../helpers/emails.helper';
import { renderPasswordResetHtml } from '../emails/renderEmails';
import { SMSService } from '../integrations/sms/sms.service';
import {
  buildPhoneOtpMessage,
  buildPhonePasswordResetOtpMessage,
} from '../integrations/sms/sms.messages';
import { AuthenticatedRequest } from '../types/auth.types';

// LOAD ENV
const { JWT_SECRET, CLIENT_APP_URL } = process.env;

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
const PHONE_RESET_SESSION_TTL_MS = 15 * 60 * 1000;
const TEMP_AUTH_TTL_MS = 15 * 60 * 1000;

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
  private readonly smsService: SMSService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userRoleService = new UserRoleService();
    this.roleService = new RoleService();
    this.smsService = new SMSService();
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

    const normalizedEmail = value.email ? value.email.toLowerCase().trim() : undefined;

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

    const username = String(value.username || '').trim();
    const normalizedEmail = username.toLowerCase();
    const normalizedPhone = this.tryNormalizePhoneNumber(username);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .addSelect('user.passwordHash');

    if (normalizedPhone) {
      queryBuilder.where('LOWER(user.email) = :email', { email: normalizedEmail }).orWhere(
        'user.phone_number = :phoneNumber',
        { phoneNumber: normalizedPhone }
      );
    } else {
      queryBuilder.where('LOWER(user.email) = :email', { email: normalizedEmail });
    }

    const userExists = await queryBuilder.getOne();

    if (!userExists) {
      throw new ValidationError('Invalid username or password');
    }

    if (!userExists.hasSetPassword) {
      throw new ValidationError(
        'This account does not have a password yet. Continue with phone verification.',
      );
    }

    const isPasswordValid = await comparePasswords(
      value.password,
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
    const { error, value } = validatePhoneLoginPrecheck(body);
    if (error) {
      throw new ValidationError(error.message);
    }

    const phoneNumber = formatLocalPhoneNumber(value.phoneNumber);
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
    const { error, value } = validateSendPhoneOtp(body);
    if (error) {
      throw new ValidationError(error.message);
    }

    const phoneNumber = formatLocalPhoneNumber(value.phoneNumber);
    const user = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (!user) {
      throw new ValidationError('Unable to send verification code');
    }

    if (user.hasSetPassword) {
      throw new ValidationError('This account already has a password. Use phone + password login.');
    }

    const now = Date.now();
    const lastSentAt = user.phoneOtpLastSentAt?.getTime();
    if (lastSentAt && now - lastSentAt < PHONE_OTP_RESEND_COOLDOWN_MS) {
      throw new ValidationError('Please wait before requesting another verification code.');
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
      throw new ValidationError('Unable to send verification code. Please try again.');
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
    const { error, value } = validateVerifyPhoneOtp(body);
    if (error) {
      throw new ValidationError(error.message);
    }

    const phoneNumber = formatLocalPhoneNumber(value.phoneNumber);
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
      throw new ValidationError('Maximum OTP attempts reached. Request a new code.');
    }

    const otpHash = this.hashOtp(value.otp);
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
    const { error, value } = validateSendPhoneResetOtp(body);
    if (error) {
      throw new ValidationError(error.message);
    }

    const phoneNumber = formatLocalPhoneNumber(value.phoneNumber);
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
      throw new ValidationError('Please wait before requesting another reset code.');
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
  async verifyPhoneResetOtp(body: { phoneNumber?: string; otp?: string }): Promise<{
    resetToken: string;
    expiresInSeconds: number;
  }> {
    const { error, value } = validateVerifyPhoneResetOtp(body);
    if (error) {
      throw new ValidationError(error.message);
    }

    const phoneNumber = formatLocalPhoneNumber(value.phoneNumber);
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
      throw new ValidationError('Maximum OTP attempts reached. Request a new code.');
    }

    const otpHash = this.hashOtp(value.otp);
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
    const resetSessionHash = hashResetToken(rawResetToken);
    const resetSessionExpiresAt = new Date(now + PHONE_RESET_SESSION_TTL_MS);

    await this.userRepository.update(
      { id: user.id },
      {
        phoneResetOtpHash: null,
        phoneResetOtpExpiresAt: null,
        phoneResetOtpAttempts: 0,
        phoneResetOtpLastSentAt: null,
        phoneResetSessionHash: resetSessionHash,
        phoneResetSessionExpiresAt: resetSessionExpiresAt,
      }
    );

    return {
      resetToken: rawResetToken,
      expiresInSeconds: Math.floor(PHONE_RESET_SESSION_TTL_MS / 1000),
    };
  }

  /**
   * RESET PASSWORD WITH PHONE VERIFICATION
   */
  async resetPasswordWithPhone(body: {
    phoneNumber?: string;
    resetToken?: string;
    password?: string;
  }): Promise<{ message: string }> {
    const { error, value } = validatePhoneResetPassword(body);
    if (error) {
      throw new ValidationError(error.message);
    }

    const phoneNumber = formatLocalPhoneNumber(value.phoneNumber);
    const resetSessionHash = hashResetToken(value.resetToken);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.phone_number = :phoneNumber', { phoneNumber })
      .andWhere('user.phone_reset_session_hash = :sessionHash', {
        sessionHash: resetSessionHash,
      })
      .andWhere('user.phone_reset_session_expires_at > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new ValidationError('Invalid or expired reset session');
    }

    const newPasswordHash = await hashPassword(value.password);

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        passwordHash: newPasswordHash,
        hasSetPassword: true,
        phoneResetOtpHash: null,
        phoneResetOtpExpiresAt: null,
        phoneResetOtpAttempts: 0,
        phoneResetOtpLastSentAt: null,
        phoneResetSessionHash: null,
        phoneResetSessionExpiresAt: null,
        passwordResetTokenHash: null,
        passwordResetExpires: null,
      } as any)
      .where('id = :id', { id: user.id })
      .execute();

    return { message: 'Your password has been updated. You can sign in now.' };
  }

  /**
   * COMPLETE REGISTRATION
   */
  async completeRegistration(
    body: { email?: string; password?: string },
    req: Request
  ): Promise<{ user: User; token: string }> {
    const { error, value } = validateCompleteRegistration(body);
    if (error) {
      throw new ValidationError(error.message);
    }

    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.id) {
      throw new UnauthorizedError('Unauthorized');
    }

    const user = await this.userRepository.findOne({
      where: { id: authReq.user.id },
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
      throw new UnauthorizedError('Your verification session has expired. Please login again.');
    }

    const normalizedEmail = value.email ? value.email.toLowerCase().trim() : undefined;

    if (normalizedEmail) {
      const emailOwner = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });

      if (emailOwner && emailOwner.id !== user.id) {
        throw new ValidationError('Email is already in use');
      }
    }

    const passwordHash = await hashPassword(value.password);

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

  private signAuthToken(
    userId: User['id'],
    mustCompleteRegistration: boolean = false
  ): string {
    return jwt.sign(
      {
        id: userId,
        mustCompleteRegistration,
      },
      String(JWT_SECRET)
    );
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
