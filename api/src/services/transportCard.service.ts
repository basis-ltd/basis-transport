import { FindOptionsWhere, Repository } from 'typeorm';
import { TransportCard } from '../entities/transportCard.entity';
import { AppDataSource } from '../data-source';
import {
  validateCreateTransportCard,
  validateUpdateTransportCard,
} from '../validations/transportCard.validations';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';
import { UUID } from '../types';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';
import { AuditDelete, AuditUpdate } from '../decorators/auditLog.decorator';
import { auditLogServiceSingleton } from './auditLog.service';

export class TransportCardService {
  private readonly transportCardRepository: Repository<TransportCard>;

  constructor() {
    this.transportCardRepository = AppDataSource.getRepository(TransportCard);
  }

  /** Used by @AuditUpdate / @AuditDelete for loading prior state. */
  async getEntityById(id: UUID): Promise<TransportCard | null> {
    return this.transportCardRepository.findOne({
      where: { id },
      relations: { createdBy: true },
    });
  }

  /**
   * CREATE TRANSPORT CARD
   */
  async createTransportCard(transportCard: Partial<TransportCard>) {
    const { error, value } = validateCreateTransportCard(transportCard);

    if (error) {
      throw new ValidationError(error.message);
    }

    const existingTransportCard = await this.transportCardRepository.findOne({
      where: { cardNumber: value.cardNumber },
    });

    if (existingTransportCard) {
      throw new ConflictError('Transport card already exists', {
        referenceType: LogReferenceTypes.TRANSPORT_CARD,
        userId: existingTransportCard?.createdById,
        referenceId: existingTransportCard?.id,
      });
    }

    const newTransportCard = await this.transportCardRepository.save(value);

    try {
      await auditLogServiceSingleton.logCreate(
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
      | FindOptionsWhere<TransportCard>
      | FindOptionsWhere<TransportCard>[];
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
  @AuditDelete({
    entityType: 'TransportCard',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async deleteTransportCard(
    id: UUID,
    metadata?: { createdById?: UUID }
  ): Promise<void> {
    const transportCard = await this.getTransportCardById(id);

    await this.transportCardRepository.delete(transportCard.id);
  }

  /**
   * UPDATE TRANSPORT CARD
   */
  @AuditUpdate({
    entityType: 'TransportCard',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[2]?.createdById,
  })
  async updateTransportCard(
    id: UUID,
    transportCard: Partial<TransportCard>,
    metadata?: { createdById?: UUID }
  ): Promise<TransportCard> {
    const { error, value } = validateUpdateTransportCard(transportCard);

    if (error) {
      throw new ValidationError(error.message);
    }

    const existingTransportCard = await this.getTransportCardById(id);

    return await this.transportCardRepository.save({
      ...existingTransportCard,
      ...value,
    });
  }
}
