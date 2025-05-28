import Joi from 'joi';
import { Permission } from '../entities/permission.entity';
import { PermissionNames } from '../constants/permission.constants';

// VALIDATE CREATE PERMISSION
export const validateCreatePermission = (permission: Partial<Permission>) => {
  const schema = Joi.object({
    name: Joi.string().valid(...Object.values(PermissionNames)),
    description: Joi.string().optional(),
  });

  return schema.validate(permission);
};
