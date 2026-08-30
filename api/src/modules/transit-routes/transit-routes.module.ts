import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransitRoute } from '../../entities/transitRoute.entity';
import { RouteStop } from '../../entities/routeStop.entity';
import { RouteFrequency } from '../../entities/routeFrequency.entity';
import { TransitRoutesController } from './transit-routes.controller';
import { TransitRoutesService } from './transit-routes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransitRoute, RouteStop, RouteFrequency]),
  ],
  controllers: [TransitRoutesController],
  providers: [TransitRoutesService],
  exports: [TransitRoutesService],
})
export class TransitRoutesModule {}
