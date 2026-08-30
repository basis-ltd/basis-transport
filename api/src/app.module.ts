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
import { LocationsModule } from './modules/locations/locations.module';
import { TripsModule } from './modules/trips/trips.module';
import { UserTripsModule } from './modules/user-trips/user-trips.module';
import { TransportCardsModule } from './modules/transport-cards/transport-cards.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { SmsModule } from './integrations/sms/sms.module';
import { AgenciesModule } from './modules/agencies/agencies.module';
import { CorridorsModule } from './modules/corridors/corridors.module';
import { StopsModule } from './modules/stops/stops.module';
import { TransitRoutesModule } from './modules/transit-routes/transit-routes.module';
import { HealthModule } from './modules/health/health.module';

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
    LocationsModule,
    TripsModule,
    UserTripsModule,
    TransportCardsModule,
    DashboardModule,
    AuditLogsModule,
    AgenciesModule,
    CorridorsModule,
    StopsModule,
    TransitRoutesModule,
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
