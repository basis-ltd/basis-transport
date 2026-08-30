import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/userRole.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { Location } from '../entities/location.entity';
import { Trip } from '../entities/trip.entity';
import { UserTrip } from '../entities/userTrip.entity';
import { TransportCard } from '../entities/transportCard.entity';
import { AuditLog } from '../entities/auditLog.entity';
import { HttpAuditLog } from '../entities/httpAuditLog.entity';
import { Log } from '../entities/log.entity';
import { Agency } from '../entities/agency.entity';
import { Corridor } from '../entities/corridor.entity';
import { Stop } from '../entities/networkStop.entity';
import { TransitRoute } from '../entities/transitRoute.entity';
import { RouteStop } from '../entities/routeStop.entity';
import { RouteFrequency } from '../entities/routeFrequency.entity';

export const entities = [
  User,
  Role,
  UserRole,
  Permission,
  RolePermission,
  Location,
  Trip,
  UserTrip,
  TransportCard,
  AuditLog,
  HttpAuditLog,
  Log,
  Agency,
  Corridor,
  Stop,
  TransitRoute,
  RouteStop,
  RouteFrequency,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('database.host');
        const sslDisabledHosts = [
          'localhost',
          'host.docker.internal',
          '127.0.0.1',
          '/var/run/postgresql',
        ];

        return {
          type: 'postgres' as const,
          host,
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          synchronize: true,
          logging: false,
          entities,
          ssl: sslDisabledHosts.includes(String(host))
            ? false
            : { rejectUnauthorized: false },
        };
      },
    }),
    TypeOrmModule.forFeature(entities),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
