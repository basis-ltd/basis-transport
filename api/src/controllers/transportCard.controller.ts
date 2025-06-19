import { Request, Response, NextFunction } from 'express';
import { TransportCardService } from '../services/transportCard.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { UUID } from '../types';
import { FindOptionsWhere, ILike } from 'typeorm';
import { TransportCard } from '../entities/transportCard.entity';

// INITIALIZE SERVICES
const transportCardService = new TransportCardService();

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

      await transportCardService.deleteTransportCard(id as UUID, {
        createdById: user.id,
      });

      return res.status(204).json({
        message: 'Transport card deleted successfully',
      });
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

      const transportCard = await transportCardService.updateTransportCard(
        id as UUID,
        req.body
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

      // BUILD CONDITION
      let condition:
        | FindOptionsWhere<TransportCard>
        | FindOptionsWhere<TransportCard>[] = {};

      // USER ID
      if (createdById) {
        condition.createdById = createdById as UUID;
      }

      // NAME
      if (name) {
        condition = [
          {
            name: ILike(`%${name}%`),
          },
        ];
      }

      // CARD NUMBER
      if (cardNumber) {
        condition = [
          {
            cardNumber: ILike(`%${cardNumber}%`),
          },
        ];
      }

      // FETCH TRANSPORT CARDS
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

      const transportCard = await transportCardService.getTransportCardById(
        id as UUID
      );

      return res.status(200).json({
        message: 'Transport card fetched successfully',
        data: transportCard,
      });
    } catch (error) {
      next(error);
    }
  }
}
