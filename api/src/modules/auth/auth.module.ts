import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/userRole.entity';
import { AppConfig } from '../../config/config.types';
import { SmsModule } from '../../integrations/sms/sms.module';
import { RolesModule } from '../roles/roles.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRoleService } from './user-role.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        secret: config.get('jwt.secret', { infer: true }),
      }),
    }),
    SmsModule,
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRoleService, JwtStrategy],
  exports: [AuthService, UserRoleService],
})
export class AuthModule {}
