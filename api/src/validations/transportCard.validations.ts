import Joi from 'joi';
import { TransportCard } from '../entities/transportCard.entity';

// CREATE TRANSPORT CARD
export const validateCreateTransportCard = (
  transportCard: Partial<TransportCard>
) => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    cardNumber: Joi.string().required(),
    userId: Joi.string().uuid().required(),
  });

  return schema.validate(transportCard);
};

// UPDATE TRANSPORT CARD
export const validateUpdateTransportCard = (
  transportCard: Partial<TransportCard>
) => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    cardNumber: Joi.string().optional(),
  });

  return schema.validate(transportCard);
};
