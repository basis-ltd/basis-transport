import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { NetworkModule } from '../network/network.module';

@Module({
  imports: [NetworkModule],
  controllers: [HealthController],
})
export class HealthModule {}
