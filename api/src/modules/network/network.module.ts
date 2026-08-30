import { Module } from '@nestjs/common';
import {
  NetworkAdminController,
  NetworkController,
  ReportsController,
  SavedItemsController,
} from './network.controller';
import { NetworkService } from './network.service';
import { WalkingService } from './walking.service';
import { PublicNetworkGuard } from './public-network.guard';

@Module({
  controllers: [
    NetworkController,
    SavedItemsController,
    ReportsController,
    NetworkAdminController,
  ],
  providers: [NetworkService, WalkingService, PublicNetworkGuard],
  exports: [NetworkService],
})
export class NetworkModule {}
