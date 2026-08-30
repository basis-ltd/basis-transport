import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { NetworkService, internalNetwork } from '../network/network.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/auth.decorators';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly network: NetworkService
  ) {}

  @Public()
  @Get()
  async getHealth(@Res({passthrough:true}) response: Response) {
    let database = 'up';

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = 'down';
    }

    const network = await this.network.status();
    const ready=database==='up'&&network.ready&&(internalNetwork()||network.walkingAvailable);
    if (!ready) response.status(503);
    return {
      message: 'Service health retrieved successfully',
      data: {
        status: ready ? 'ok' : 'degraded',
        database,
        networkReady: network.ready,
        walkingAvailable:network.walkingAvailable,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    };
  }
}
