import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
import {
  IsStrongPassword,
  PASSWORD_VALIDATION_MESSAGE,
} from '../../../common/validators/password.validator';

const OTP_PATTERN = /^\d{6}$/;

export class SignupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  password: string;

  @IsString()
  phoneNumber: string;
}

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class PhonePrecheckDto {
  @IsString()
  phoneNumber: string;
}

export class SendPhoneOtpDto {
  @IsString()
  phoneNumber: string;
}

export class VerifyPhoneOtpDto {
  @IsString()
  phoneNumber: string;

  @Matches(OTP_PATTERN, { message: 'OTP must be a 6 digit code' })
  otp: string;
}

export class VerifyPhoneResetOtpDto {
  @IsString()
  phoneNumber: string;

  @Matches(OTP_PATTERN, { message: 'OTP must be a 6 digit code' })
  otp: string;
}

export class CompleteRegistrationDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}

export { PASSWORD_VALIDATION_MESSAGE };
