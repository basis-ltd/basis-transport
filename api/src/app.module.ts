import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { EmailModule } from './integrations/email/email.module';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard, RolesGuard } from './common/guards/jwt-auth.guard';
import { HttpAuditInterceptor } from './common/interceptors/http-audit.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { LogsModule } from './modules/logs/logs.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { SmsModule } from './integrations/sms/sms.module';
import { HealthModule } from './modules/health/health.module';
import { NetworkModule } from './modules/network/network.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    DatabaseModule,
    EmailModule,
    CommonModule,
    LogsModule,
    SmsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AuditLogsModule,
    NetworkModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpAuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('api/*');
  }
}
