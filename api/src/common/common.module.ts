import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtAuthGuard, RolesGuard } from './guards/jwt-auth.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, TypeOrmModule],
})
export class CommonModule {}
