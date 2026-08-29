import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from '../../services/auth.service';
import { UserRoleService } from '../../services/userRole.service';
import { UserRole } from '../../entities/userRole.entity';
import { SmsModule } from '../../integrations/sms/sms.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    SmsModule,
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRoleService],
})
export class AuthModule {}
