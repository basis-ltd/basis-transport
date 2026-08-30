import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/auth.decorators';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  @Public()
  @Get()
  async getHealth() {
    let database = 'up';

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = 'down';
    }

    return {
      message: 'Service health retrieved successfully',
      data: {
        status: database === 'up' ? 'ok' : 'degraded',
        database,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    };
  }
}
