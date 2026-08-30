import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Corridor } from '../../entities/corridor.entity';
import { CorridorsController } from './corridors.controller';
import { CorridorsService } from './corridors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Corridor])],
  controllers: [CorridorsController],
  providers: [CorridorsService],
  exports: [CorridorsService],
})
export class CorridorsModule {}
