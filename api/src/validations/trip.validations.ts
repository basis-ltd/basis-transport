import Joi from 'joi';
import { Trip } from '../entities/trip.entity';
import { TripStatus } from '../constants/trip.constants';

// VALIDATE CREATE TRIP
export const createTripValidation = (trip: Partial<Trip>) => {
  const schema = Joi.object({
    locationFromId: Joi.string().uuid().required(),
    locationToId: Joi.string().uuid().optional(),
    createdById: Joi.string().uuid().required(),
    status: Joi.string().valid(...Object.values(TripStatus)).optional(),
    totalCapacity: Joi.number().optional(),
    currentLocation: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).required(),
    }).optional(),
  });

  return schema.validate(trip);
};

// VALIDATE UPDATE TRIP
export const updateTripValidation = (trip: Partial<Trip>) => {
  const schema = Joi.object({
    currentLocation: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).required(),
    }).optional(),
    locationToId: Joi.string().uuid().optional(),
    status: Joi.string().valid(...Object.values(TripStatus)).optional(),
    totalCapacity: Joi.number().optional(),
    locationFromId: Joi.string().uuid().optional(),
    createdById: Joi.string().uuid().optional(),
  });
  return schema.validate(trip);
};
