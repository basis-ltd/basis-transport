import { User } from '../entities/user.entity';
import Joi from 'joi';
import { ValidationError } from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';

// VALIDATE SIGNUP
export const validateSignUp = (user: Partial<User>) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().optional().allow(null, ''),
    password: Joi.string().required(),
    phoneNumber: Joi.string().required(),
  });

  return schema.validate(user);
};

// VALIDATE LOGIN
export const validateLogin = (user: Partial<User>) => {
  const schema = Joi.object({
    username: Joi.string().trim().required(),
    password: Joi.string().required(),
  });

  return schema.validate(user);
};

const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

// VALIDATE FORGOT PASSWORD
export const validateForgotPassword = (body: { email?: string }) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  return schema.validate(body);
};

// VALIDATE RESET PASSWORD
export const validateResetPassword = (body: {
  token?: string;
  password?: string;
}) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
      .pattern(PASSWORD_PATTERN)
      .required()
      .messages({
        'string.pattern.base':
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      }),
  });

  return schema.validate(body);
};

// VALIDATE PHONE LOGIN PRECHECK
export const validatePhoneLoginPrecheck = (body: { phoneNumber?: string }) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().required(),
  });

  return schema.validate(body);
};

// VALIDATE SEND PHONE OTP
export const validateSendPhoneOtp = (body: { phoneNumber?: string }) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().required(),
  });

  return schema.validate(body);
};

// VALIDATE SEND PHONE RESET OTP
export const validateSendPhoneResetOtp = (body: { phoneNumber?: string }) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().required(),
  });

  return schema.validate(body);
};

// VALIDATE VERIFY PHONE OTP
export const validateVerifyPhoneOtp = (body: {
  phoneNumber?: string;
  otp?: string;
}) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().required(),
    otp: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'OTP must be a 6 digit code',
    }),
  });

  return schema.validate(body);
};

// VALIDATE VERIFY PHONE RESET OTP
export const validateVerifyPhoneResetOtp = (body: {
  phoneNumber?: string;
  otp?: string;
}) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().required(),
    otp: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'OTP must be a 6 digit code',
    }),
  });

  return schema.validate(body);
};

// VALIDATE COMPLETE REGISTRATION
export const validateCompleteRegistration = (body: {
  email?: string;
  password?: string;
}) => {
  const schema = Joi.object({
    email: Joi.string().email().optional().allow(null, ''),
    password: Joi.string()
      .pattern(PASSWORD_PATTERN)
      .required()
      .messages({
        'string.pattern.base':
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      }),
  });

  return schema.validate(body);
};

// FORMAT LOCAL PHONE NUMBER
export const formatLocalPhoneNumber = (phoneNumber: string) => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');

  if (cleanedNumber.length === 10) {
    const prefix = cleanedNumber.slice(0, 3);
    if (['078', '079', '072', '073'].includes(prefix)) {
      return `+250${cleanedNumber.slice(1)}`;
    }
  } else if (cleanedNumber.length === 9) {
    const prefix = cleanedNumber.slice(0, 2);
    if (['78', '79', '72', '73'].includes(prefix)) {
      return `+250${cleanedNumber}`;
    }
  }

  throw new ValidationError('Invalid phone number format', {
    referenceType: LogReferenceTypes.USER,
  });
};

// FORMAT INTERNATIONAL PHONE NUMBER
export const formatInternationalPhoneNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/\D/g, '');
};
