import { User } from '../entities/user.entity';
import Joi from 'joi';
import { ValidationError } from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';

// VALIDATE SIGNUP
export const validateSignUp = (user: Partial<User>) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phoneNumber: Joi.string().required(),
  });

  return schema.validate(user);
};

// VALIDATE LOGIN
export const validateLogin = (user: Partial<User>) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(user);
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
