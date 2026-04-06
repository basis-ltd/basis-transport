import Joi from 'joi';
import { TransportCard } from '../entities/transportCard.entity';
import { TransportCardProvider } from '../constants/transportCard.constants';

// CREATE TRANSPORT CARD
export const validateCreateTransportCard = (
  transportCard: Partial<TransportCard>
) => {
  const schema = Joi.object({
    name: Joi.string().optional().allow('', null),
    cardNumber: Joi.string().required(),
    provider: Joi.string()
      .valid(...Object.values(TransportCardProvider))
      .optional()
      .allow(null),
    createdById: Joi.string().uuid().required(),
  });

  return schema.validate(transportCard);
};

// UPDATE TRANSPORT CARD
export const validateUpdateTransportCard = (
  transportCard: Partial<TransportCard>
) => {
  const schema = Joi.object({
    name: Joi.string().optional().allow('', null),
    cardNumber: Joi.string().optional(),
    provider: Joi.string()
      .valid(...Object.values(TransportCardProvider))
      .optional()
      .allow(null),
  });

  return schema.validate(transportCard);
};
