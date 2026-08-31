import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CurrentUser,
  Public,
  Roles,
} from '../../common/decorators/auth.decorators';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { RoleTypes } from '../../constants/role.constants';
import {
  PassengerReport,
  SavedItem,
} from '../../entities/networkDataset.entity';
import {
  DatasetMetadataDto,
  DraftSnapshotDto,
  NetworkQueryDto,
  NetworkMapQueryDto,
  PlanJourneyDto,
  PublishDto,
  ReportDto,
  ReviewReportDto,
  ReviewTransferDto,
  SavedItemDto,
} from './network.dto';
import { NetworkService } from './network.service';
import { PublicNetworkGuard } from './public-network.guard';
import type { NetworkSnapshot } from './network.types';

const envelope = <T>(data: T, message = 'Request completed successfully') => ({
  message,
  data,
});

@Public()
@UseGuards(PublicNetworkGuard)
@Controller()
export class NetworkController {
  constructor(private readonly network: NetworkService) {}
  @Get('network/status') async status() {
    return envelope(await this.network.status());
  }
  @Get('network/map') async map(@Query() query: NetworkMapQueryDto) {
    return envelope(await this.network.map(query));
  }
  @Post('journeys/plan') @HttpCode(200) async plan(
    @Body() body: PlanJourneyDto
  ) {
    return envelope(await this.network.plan(body));
  }
  @Get('stops') async stops(@Query() query: NetworkQueryDto) {
    return envelope(await this.network.listStops(query));
  }
  @Get('stops/:id') async stop(@Param('id') id: string) {
    return envelope(await this.network.stop(id));
  }
  @Get('routes') async routes(@Query() query: NetworkQueryDto) {
    return envelope(await this.network.listRoutes(query));
  }
  @Get('routes/:id') async route(@Param('id') id: string) {
    return envelope(await this.network.route(id));
  }
}

@Controller('me/saved-items')
export class SavedItemsController {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  @Get() async list(@CurrentUser() user: AuthenticatedUser) {
    return envelope(
      await this.db.getRepository(SavedItem).find({
        where: { userId: user.id },
        order: { createdAt: 'DESC' },
        take: 100,
      })
    );
  }
  @Post() async save(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SavedItemDto
  ) {
    if (
      !/^\/(travel\?|stops\/[^/?#]+$|routes\/[^/?#]+$)/.test(body.href) ||
      body.href.includes('\\')
    )
      throw new BadRequestException(
        'Only Basis journey, stop, and route links can be saved.'
      );
    const repo = this.db.getRepository(SavedItem);
    if (
      (await repo.countBy({ userId: user.id })) >= 100 &&
      !(await repo.existsBy({ userId: user.id, key: body.key }))
    )
      throw new BadRequestException('You can synchronize up to 100 favorites.');
    await repo.upsert({ ...body, userId: user.id }, ['userId', 'key']);
    return envelope(await repo.findOneBy({ userId: user.id, key: body.key }));
  }
  @Delete(':id') @HttpCode(204) async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    await this.db.getRepository(SavedItem).delete({ id, userId: user.id });
  }
}

@Controller('reports')
export class ReportsController {
  constructor(@InjectDataSource() private readonly db: DataSource) {}
  @Post()
  @Public()
  @UseGuards(PublicNetworkGuard)
  async create(@Body() body: ReportDto) {
    if (body.website)
      throw new BadRequestException('Unable to accept this submission.');
    if (!body.message.trim()) throw new BadRequestException('Enter a message.');
    if (body.kind === 'contact' && !body.email)
      throw new BadRequestException(
        'An email address is required for contact messages.'
      );
    const report = await this.db.getRepository(PassengerReport).save({
      kind: body.kind,
      referenceId: body.referenceId || null,
      email: body.email || null,
      name: body.name || null,
      message: body.message.trim(),
      status: 'open',
    });
    return envelope({ id: report.id }, 'Your message has been received.');
  }
}

@Roles(RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN)
@Controller('admin/network')
export class NetworkAdminController {
  constructor(
    private readonly network: NetworkService,
    @InjectDataSource() private readonly db: DataSource
  ) {}
  @Get('datasets') async datasets() {
    return envelope(await this.network.listDatasets());
  }
  @Get('metrics') metrics() {
    return envelope(this.network.metrics());
  }
  @Get('datasets/:id') async dataset(@Param('id', ParseUUIDPipe) id: string) {
    return envelope(await this.network.draft(id));
  }
  @Get('datasets/:id/comparison') async comparison(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return envelope(await this.network.compareDraft(id));
  }
  @Post('datasets/:id/clone') async clone(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return envelope(await this.network.clone(id));
  }
  @Patch('datasets/:id/snapshot') async edit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DraftSnapshotDto
  ) {
    return envelope(await this.network.edit(id, body as NetworkSnapshot));
  }
  @Patch('datasets/:id/metadata') async metadata(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DatasetMetadataDto
  ) {
    return envelope(await this.network.metadataUpdate(id, body));
  }
  @Post('datasets/:id/publish') async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: PublishDto
  ) {
    if (!body.confirm) throw new BadRequestException('Confirm publication.');
    return envelope(await this.network.publish(id));
  }
  @Post('datasets/:id/transfers/:transferId/review') async reviewTransfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('transferId') transferId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ReviewTransferDto
  ) {
    if (!body.confirm)
      throw new BadRequestException(
        'Confirm the pedestrian path and crossing review.'
      );
    return envelope(
      await this.network.reviewTransfer(id, transferId, user.id, body)
    );
  }
  @Get('reports') async reports(@Query() q: NetworkQueryDto) {
    const [rows, totalCount] = await this.db
      .getRepository(PassengerReport)
      .findAndCount({
        order: { createdAt: 'DESC' },
        skip: q.page * q.size,
        take: q.size,
      });
    return envelope({ rows, totalCount });
  }
  @Patch('reports/:id') async review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReviewReportDto
  ) {
    await this.db
      .getRepository(PassengerReport)
      .update(id, { status: body.status });
    return envelope({ id, status: body.status });
  }
}
