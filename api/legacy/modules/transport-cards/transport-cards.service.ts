import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TransportCard } from '../../entities/transportCard.entity';
import { ConflictError, NotFoundError } from '../../helpers/errors.helper';
import { LogReferenceTypes } from '../../constants/logs.constants';
import { UUID } from '../../types';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../../helpers/pagination.helper';
import { AuditLogService } from '../audit-logs/audit-logs.service';
import { getAuditContext } from '../../common/middleware/request-context.store';

@Injectable()
export class TransportCardService {
  constructor(
    @InjectRepository(TransportCard)
    private readonly transportCardRepository: Repository<TransportCard>,
    private readonly auditLogService: AuditLogService
  ) {}

  /**
   * CREATE TRANSPORT CARD
   */
  async createTransportCard(transportCard: Partial<TransportCard>) {
    const existingTransportCard = await this.transportCardRepository.findOne({
      where: { cardNumber: transportCard.cardNumber },
    });

    if (existingTransportCard) {
      throw new ConflictError('Transport card already exists', {
        referenceType: LogReferenceTypes.TRANSPORT_CARD,
        userId: existingTransportCard?.createdById,
        referenceId: existingTransportCard?.id,
      });
    }

    const newTransportCard =
      await this.transportCardRepository.save(transportCard);

    try {
      await this.auditLogService.logCreate(
        'TransportCard',
        newTransportCard.id,
        newTransportCard,
        newTransportCard.createdById
      );
    } catch (err) {
      console.error('TransportCard create audit (non-blocking):', err);
    }

    return newTransportCard;
  }

  /**
   * FETCH TRANSPORT CARDS
   */
  async fetchTransportCards({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition:
      FindOptionsWhere<TransportCard> | FindOptionsWhere<TransportCard>[];
  }): Promise<Pagination<TransportCard>> {
    const { skip, take } = getPagination({ page, size });

    const transportCards = await this.transportCardRepository.findAndCount({
      where: condition,
      skip,
      take,
      relations: {
        createdBy: true,
      },
    });

    return getPagingData({
      data: transportCards,
      page,
      size,
    });
  }

  /**
   * GET TRANSPORT CARD BY ID
   */
  async getTransportCardById(id: UUID) {
    const transportCard = await this.transportCardRepository.findOne({
      where: { id },
      relations: {
        createdBy: true,
      },
    });

    if (!transportCard) {
      throw new NotFoundError('Transport card not found', {
        referenceType: LogReferenceTypes.TRANSPORT_CARD,
        referenceId: id,
      });
    }

    return transportCard;
  }

  /**
   * DELETE TRANSPORT CARD
   */
  async deleteTransportCard(
    id: UUID,
    metadata?: { createdById?: UUID }
  ): Promise<void> {
    const transportCard = await this.getTransportCardById(id);
    const userId = metadata?.createdById ?? getAuditContext()?.userId;

    try {
      await this.auditLogService.logDelete(
        'TransportCard',
        transportCard.id,
        transportCard,
        userId
      );
    } catch (err) {
      console.error('TransportCard delete audit (non-blocking):', err);
    }

    await this.transportCardRepository.delete(transportCard.id);
  }

  /**
   * UPDATE TRANSPORT CARD
   */
  async updateTransportCard(
    id: UUID,
    transportCard: Partial<TransportCard>,
    metadata?: { createdById?: UUID }
  ): Promise<TransportCard> {
    const existingTransportCard = await this.getTransportCardById(id);

    const updatedTransportCard = await this.transportCardRepository.save({
      ...existingTransportCard,
      ...transportCard,
    });

    const userId = metadata?.createdById ?? getAuditContext()?.userId;

    try {
      await this.auditLogService.logUpdate(
        'TransportCard',
        updatedTransportCard.id,
        existingTransportCard,
        updatedTransportCard,
        userId
      );
    } catch (err) {
      console.error('TransportCard update audit (non-blocking):', err);
    }

    return updatedTransportCard;
  }
}
