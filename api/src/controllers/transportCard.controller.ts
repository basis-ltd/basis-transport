import { Request, Response, NextFunction } from 'express';
import { TransportCardService } from '../services/transportCard.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { UUID } from '../types';
import { FindOptionsWhere, ILike } from 'typeorm';
import { TransportCard } from '../entities/transportCard.entity';
import { isAdminLike, isOwnerOrAdmin } from '../helpers/auth.helper';
import { ForbiddenError } from '../helpers/errors.helper';

const transportCardService = new TransportCardService();

function assertCanAccessTransportCard(
  user: AuthenticatedRequest['user'],
  card: TransportCard
): void {
  if (!isOwnerOrAdmin(user, card.createdById as UUID)) {
    throw new ForbiddenError('You cannot access this transport card');
  }
}

export class TransportCardController {
  /**
   * CREATE TRANSPORT CARD
   */
  async createTransportCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;

      const transportCard = await transportCardService.createTransportCard({
        ...req.body,
        createdById: user.id,
      });
      return res.status(201).json({
        message: 'Transport card created successfully',
        data: transportCard,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE TRANSPORT CARD
   */
  async deleteTransportCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { user } = req as AuthenticatedRequest;

      const card = await transportCardService.getTransportCardById(id as UUID);
      assertCanAccessTransportCard(user, card);

      await transportCardService.deleteTransportCard(id as UUID, {
        createdById: user.id,
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * UPDATE TRANSPORT CARD
   */
  async updateTransportCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { user } = req as AuthenticatedRequest;

      const existing = await transportCardService.getTransportCardById(id as UUID);
      assertCanAccessTransportCard(user, existing);

      const transportCard = await transportCardService.updateTransportCard(
        id as UUID,
        req.body,
        { createdById: user.id }
      );

      return res.status(200).json({
        message: 'Transport card updated successfully',
        data: transportCard,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * FETCH TRANSPORT CARDS
   */
  async fetchTransportCards(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      const { page = 0, size = 10, name, cardNumber, createdById } = req.query;

      const condition: FindOptionsWhere<TransportCard> = {};

      if (isAdminLike(user)) {
        if (createdById) {
          condition.createdById = createdById as UUID;
        }
      } else {
        condition.createdById = user.id;
      }

      if (name) {
        condition.name = ILike(`%${String(name)}%`);
      }

      if (cardNumber) {
        condition.cardNumber = ILike(`%${String(cardNumber)}%`);
      }

      const transportCards = await transportCardService.fetchTransportCards({
        page: Number(page),
        size: Number(size),
        condition,
      });

      return res.status(200).json({
        message: 'Transport cards fetched successfully',
        data: transportCards,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET TRANSPORT CARD BY ID
   */
  async getTransportCardById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { user } = req as AuthenticatedRequest;

      const transportCard = await transportCardService.getTransportCardById(
        id as UUID
      );
      assertCanAccessTransportCard(user, transportCard);

      return res.status(200).json({
        message: 'Transport card fetched successfully',
        data: transportCard,
      });
    } catch (error) {
      next(error);
    }
  }
}
