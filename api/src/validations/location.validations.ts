import Joi from 'joi';
import { Location } from '../entities/location.entity';

// VALIDATE CREATE LOCATION
export const createLocationValidation = (location: Partial<Location>) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    address: Joi.object({
      type: Joi.string()
        .valid(
          'Point',
          'LineString',
          'Polygon',
          'MultiPoint',
          'MultiLineString',
          'MultiPolygon',
          'GeometryCollection'
        )
        .required(),
      coordinates: Joi.array().required(),
    }).required(),
    createdById: Joi.string().uuid().required(),
  });

  return schema.validate(location);
};

// VALIDATE UPDATE LOCATION
export const updateLocationValidation = (location: Partial<Location>) => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    address: Joi.object({
      type: Joi.string()
        .valid(
          'Point',
          'LineString',
          'Polygon',
          'MultiPoint',
          'MultiLineString',
          'MultiPolygon',
          'GeometryCollection'
        )
        .optional(),
      coordinates: Joi.array().optional(),
    }).optional(),
  });

  return schema.validate(location);
};
