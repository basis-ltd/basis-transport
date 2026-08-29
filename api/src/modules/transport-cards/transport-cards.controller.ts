import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { TransportCardService } from '../../services/transportCard.service';
import { CurrentUser } from '../../common/decorators/auth.decorators';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { UUID } from '../../types';
import { TransportCard } from '../../entities/transportCard.entity';
import { isAdminLike, isOwnerOrAdmin } from '../../helpers/auth.helper';
import { ForbiddenError } from '../../helpers/errors.helper';
import { TransportCardProvider } from '../../constants/transportCard.constants';

function assertCanAccessTransportCard(
  user: AuthenticatedUser,
  card: TransportCard
): void {
  if (!isOwnerOrAdmin(user, card.createdById as UUID)) {
    throw new ForbiddenError('You cannot access this transport card');
  }
}

@Controller('transport-cards')
export class TransportCardsController {
  constructor(private readonly transportCardService: TransportCardService) {}

  @Post()
  @HttpCode(201)
  async createTransportCard(
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const transportCard = await this.transportCardService.createTransportCard({
      ...body,
      createdById: user.id,
    });
    return {
      message: 'Transport card created successfully',
      data: transportCard,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteTransportCard(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const card = await this.transportCardService.getTransportCardById(
      id as UUID
    );
    assertCanAccessTransportCard(user, card);

    await this.transportCardService.deleteTransportCard(id as UUID, {
      createdById: user.id,
    });
  }

  @Patch(':id')
  async updateTransportCard(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const existing = await this.transportCardService.getTransportCardById(
      id as UUID
    );
    assertCanAccessTransportCard(user, existing);

    const transportCard = await this.transportCardService.updateTransportCard(
      id as UUID,
      body,
      { createdById: user.id }
    );

    return {
      message: 'Transport card updated successfully',
      data: transportCard,
    };
  }

  @Get()
  async fetchTransportCards(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('name') name?: string,
    @Query('cardNumber') cardNumber?: string,
    @Query('createdById') createdById?: string,
    @Query('provider') provider?: string
  ) {
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

    if (
      provider &&
      Object.values(TransportCardProvider).includes(
        provider as TransportCardProvider
      )
    ) {
      condition.provider = provider as TransportCardProvider;
    }

    const transportCards = await this.transportCardService.fetchTransportCards({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Transport cards fetched successfully',
      data: transportCards,
    };
  }

  @Get(':id')
  async getTransportCardById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const transportCard = await this.transportCardService.getTransportCardById(
      id as UUID
    );
    assertCanAccessTransportCard(user, transportCard);

    return {
      message: 'Transport card fetched successfully',
      data: transportCard,
    };
  }
}
