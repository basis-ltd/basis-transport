import Joi from 'joi';
import { UserTrip } from '../entities/userTrip.entity';
import { UserTripStatus } from '../constants/userTrip.constants';

// CREATE USER TRIP VALIDATION
export const createUserTripValidation = (userTrip: Partial<UserTrip>) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    tripId: Joi.string().required(),
    entranceLocation: Joi.object({
      type: Joi.string().required(),
      coordinates: Joi.array().required(),
    }).required(),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
    status: Joi.string()
      .valid(...Object.values(UserTripStatus))
      .optional()
      .default(UserTripStatus.IN_PROGRESS),
    exitLocation: Joi.object({
      type: Joi.string().required(),
      coordinates: Joi.array().required(),
    }).optional(),
    createdById: Joi.string().required(),
  });

  return schema.validate(userTrip);
};

// UPDATE USER TRIP VALIDATION
export const updateUserTripValidation = (userTrip: Partial<UserTrip>) => {
  const schema = Joi.object({
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
    status: Joi.string()
      .valid(...Object.values(UserTripStatus))
      .optional(),
    exitLocation: Joi.object({
      type: Joi.string().required(),
      coordinates: Joi.array().required(),
    }).optional(),
    entranceLocation: Joi.object({
      type: Joi.string().required(),
      coordinates: Joi.array().required(),
    }).optional(),
    createdById: Joi.string().required(),
  });

  return schema.validate(userTrip);
};
