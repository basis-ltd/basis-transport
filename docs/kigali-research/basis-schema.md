# Basis Transport schema inspection

Inspected **read-only** on the user machine NISHIMWE.local (machineId 463fe9a2-d823-41f4-8eab-39820fb11b8d, connected).

- Repo: /Users/nishimweprince/Documents/Basis/Apps/basis-transport
- Time: Sunday 30 Aug 2026 ~1:06 AM CDT
- No files edited. No git writes. No servers started/stopped. No repo clone to the box.

This is an **operational trip-management schema**, not a GTFS network schema. There are no agencies, routes, stop sequences, calendars, shapes, vehicles, or fare rules. A seed written today can only populate the tables that already exist.

---

## 1. Database type

| Layer | Choice |
|---|---|
| RDBMS | PostgreSQL (pg ^8.15.6) |
| ORM | TypeORM ^0.3.22 via @nestjs/typeorm ^10.0.2 |
| Schema source of truth | TypeORM entities under api/src/entities/ |
| Migrations | None. synchronize: true auto-creates/alters tables at boot |
| Prisma / Drizzle / Mongoose / SQLite | Not present |
| GIS | PostgreSQL geometry columns plus PostGIS ST_Distance / ST_MakePoint |
| DB name (local .env) | basis_transport on localhost:5432, user nishimweprince |
| Default API port | 8080 |

No migrate script. Schema appears when the Nest API boots against Postgres with PostGIS. Seed scripts open a Nest application context and need the same env vars as the API.

Root README still shows hyphenated basis-transport and PORT=5000; running code uses 8080 and basis_transport.

### Copied: api/src/database/database.module.ts

--- begin api/src/database/database.module.ts ---
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
--- end database.module.ts ---

## 2. Current schema (models)

Every table inherits AbstractEntity (api/src/entities/abstract.entity.ts):

| Column | Type | Notes |
|---|---|
| id | uuid PK | PrimaryGeneratedColumn uuid |
| created_at | timestamptz | default CURRENT_TIMESTAMP |
| updated_at | timestamptz | |
| created_by_id | uuid nullable | FK to users.id ON DELETE SET NULL |
| last_updated_by_id | uuid nullable | FK to users.id ON DELETE SET NULL |

There is no routes, stops, stop_times, schedules, vehicles, agencies, calendar, shapes, or fare_rules table/entity.

### Copied: api/src/entities/abstract.entity.ts

--- begin api/src/entities/abstract.entity.ts ---
import { UUID } from '../types';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { User } from './user.entity';

export abstract class AbstractEntity {
  // ID
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  // CREATED AT
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  // UPDATED AT
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  // CREATED BY ID
  @Column({
    name: 'created_by_id',
    type: 'uuid',
    nullable: true,
  })
  createdById?: UUID;

  // LAST UPDATED BY ID
  @Column({
    name: 'last_updated_by_id',
    type: 'uuid',
    nullable: true,
  })
  lastUpdatedById?: UUID;

  /**
   * RELATIONS
   * User is resolved lazily via require() to avoid a circular import with user.entity.ts
   * (which extends AbstractEntity).
   */

  // CREATED BY
  @ManyToOne(() => require('./user.entity').User, (user: User) => user.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  // LAST UPDATED BY
  @ManyToOne(() => require('./user.entity').User, (user: User) => user.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'last_updated_by_id' })
  lastUpdatedBy?: User;
}
--- end abstract.entity.ts ---

### 2.1 locations (closest analog to GTFS stops)

File: api/src/entities/location.entity.ts

A named map point used as trip origin or destination. Not a stop on a route. No stop_code, stop_sequence, or parent station.

Create DTO (api/src/modules/locations/dto/location.dto.ts) requires GeoJSON-like { type, coordinates }. Duplicate check is (name, address).

### Copied: api/src/entities/location.entity.ts

--- begin api/src/entities/location.entity.ts ---
import { Column, Entity, Geometry, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './index';
import { UUID } from '../types';
import { User } from './user.entity';

@Entity('locations')
export class Location extends AbstractEntity {
  // NAME
  @Column({ type: 'varchar', length: 255, nullable: false, name: 'name' })
  name: string;

  // DESCRIPTION
  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  // ADDRESS
  @Column({ type: 'geometry', nullable: true, name: 'address' })
  address?: Geometry;
}
--- end location.entity.ts ---

--- begin api/src/modules/locations/dto/location.dto.ts ---
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

const GEOMETRY_TYPES = [
  'Point',
  'LineString',
  'Polygon',
  'MultiPoint',
  'MultiLineString',
  'MultiPolygon',
  'GeometryCollection',
] as const;

export class AddressDto {
  @IsString()
  @IsIn([...GEOMETRY_TYPES])
  type: string;

  @IsArray()
  coordinates: unknown[];
}

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
--- end location.dto.ts ---

### 2.2 trips (NOT GTFS trips)

File: api/src/entities/trip.entity.ts

A one-off vehicle journey between two locations, with lifecycle status and capacity. No route_id, service_id, shape_id, direction_id, or vehicle assignment.

TripStatus (api/src/constants/trip.constants.ts): PENDING | IN_PROGRESS | COMPLETED | CANCELLED

reference_id is generated at create as TRIP-##### (generateReferenceId(5, TRIP) in api/src/helpers/string.helper.ts). Unique-checked in a loop, not a unique DB index.

Create DTO: locationFromId required; locationToId, status, totalCapacity, currentLocation optional.

### Copied: api/src/entities/trip.entity.ts

--- begin api/src/entities/trip.entity.ts ---
import { Column, Entity, Geometry, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '.';
import { UUID } from '../types';
import { Location } from './location.entity';
import { TripStatus } from '../constants/trip.constants';

@Entity('trips')
export class Trip extends AbstractEntity {
  // REFERENCE ID
  @Column({
    name: 'reference_id',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  referenceId: string;

  // START TIME
  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  startTime: Date;

  // END TIME
  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime: Date;

  // LOCATION FROM ID
  @Column({ name: 'location_from_id', type: 'uuid', nullable: false })
  locationFromId: UUID;

  // LOCATION TO ID
  @Column({ name: 'location_to_id', type: 'uuid', nullable: true })
  locationToId: UUID;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: false,
    enum: TripStatus,
    default: TripStatus.PENDING,
  })
  status: TripStatus;

  // TOTAL CAPACITY
  @Column({
    name: 'total_capacity',
    type: 'integer',
    nullable: true,
    default: 0,
  })
  totalCapacity: number;

  // CURRENT LOCATION
  @Column({ name: 'current_location', type: 'geometry', nullable: true })
  currentLocation: Geometry;

  /**
   * RELATIONS
   */

  // LOCATION FROM
  @ManyToOne(() => Location, (location) => location.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'location_from_id' })
  locationFrom: Location;

  // LOCATION TO
  @ManyToOne(() => Location, (location) => location.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'location_to_id' })
  locationTo: Location;
}
--- end trip.entity.ts ---

--- begin api/src/constants/trip.constants.ts ---
export enum TripStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
}
--- end trip.constants.ts ---

--- begin api/src/modules/trips/dto/trip.dto.ts ---
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TripStatus } from '../../../constants/trip.constants';
import { GeoPointDto } from '../../../common/dto/geo-point.dto';

export class CreateTripDto {
  @IsUUID()
  locationFromId: string;

  @IsOptional()
  @IsUUID()
  locationToId?: string;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsNumber()
  totalCapacity?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  currentLocation?: GeoPointDto;
}

export class UpdateTripDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  currentLocation?: GeoPointDto;

  @IsOptional()
  @IsUUID()
  locationToId?: string;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsNumber()
  totalCapacity?: number;

  @IsOptional()
  @IsUUID()
  locationFromId?: string;
}

export class QuickJoinTripDto {
  @IsString()
  phoneNumber: string;

  @ValidateNested()
  @Type(() => GeoPointDto)
  entranceLocation: GeoPointDto;
}

export class RecordEntranceDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ValidateNested()
  @Type(() => GeoPointDto)
  entranceLocation: GeoPointDto;
}
--- end trip.dto.ts ---
### 2.3 user_trips

File: api/src/entities/userTrip.entity.ts
Passenger participation. Entrance geo required. Exit geo optional.
Status: IN_PROGRESS COMPLETED CANCELLED
GeoPointDto: type Point, coordinates [lng, lat].
--- begin api/src/entities/userTrip.entity.ts ---
import { Column, Entity, Geometry, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from '.';
import { UUID } from '../types';
import { Trip } from './trip.entity';
import { UserTripStatus } from '../constants/userTrip.constants';

@Entity('user_trips')
export class UserTrip extends AbstractEntity {
  // USER ID
  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: UUID;

  // TRIP ID
  @Column({ name: 'trip_id', type: 'uuid', nullable: false })
  tripId: UUID;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: false,
    enum: UserTripStatus,
    default: UserTripStatus.IN_PROGRESS,
  })
  status: UserTripStatus;

  // ENTRANCE LOCATION
  @Column({ name: 'entrance_location', type: 'geometry', nullable: false })
  entranceLocation: Geometry;

  // EXIT LOCATION
  @Column({ name: 'exit_location', type: 'geometry', nullable: true })
  exitLocation: Geometry;

  // START TIME
  @Column({ name: 'start_time', type: 'timestamptz', nullable: false })
  startTime: Date;

  // END TIME
  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime: Date;

  /**
   * RELATIONS
   */

  // USER
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // TRIP
  @ManyToOne(() => Trip, (trip) => trip.id)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;
}
--- end userTrip.entity.ts ---

--- begin api/src/constants/userTrip.constants.ts ---
export enum UserTripStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
--- end userTrip.constants.ts ---

--- begin api/src/common/dto/geo-point.dto.ts ---
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsString,
} from 'class-validator';

export class GeoPointDto {
  @IsString()
  @IsIn(['Point'])
  type: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  coordinates: number[];
}
--- end geo-point.dto.ts ---

### 2.4 transport_cards (not GTFS fare_rules)

File: api/src/entities/transportCard.entity.ts

A named card number owned via created_by_id (no dedicated user_id column). Providers: AC_GROUP | CENTRIKA. No fare amount, currency, origin/destination zone, or route association.

### Copied: api/src/entities/transportCard.entity.ts

--- begin api/src/entities/transportCard.entity.ts ---
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '.';
import { User } from './user.entity';
import { UUID } from '../types';
import { TransportCardProvider } from '../constants/transportCard.constants';

@Entity('transport_cards')
export class TransportCard extends AbstractEntity {
  // NAME
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name: string;

  // CARD NO
  @Column({
    name: 'card_number',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  cardNumber: string;

  // PROVIDER
  @Column({
    name: 'provider',
    type: 'enum',
    nullable: false,
    enum: TransportCardProvider,
    default: TransportCardProvider.AC_GROUP,
  })
  provider: TransportCardProvider;
}
--- end transportCard.entity.ts ---

### 2.5 Identity and RBAC

users (api/src/entities/user.entity.ts): name, unique email, unique phone_number, password_hash (select false), has_set_password, is_profile_complete, gender M/F, date_of_birth, nationality (default RW), status ACTIVE/INACTIVE, phone OTP and password-reset hash columns.

roles: unique name, description, status ACTIVE/INACTIVE. RoleTypes: ADMIN, SUPER_ADMIN, USER, DRIVER.

permissions: TRIP_CREATE TRIP_READ TRIP_UPDATE TRIP_DELETE USER_CREATE USER_READ USER_UPDATE USER_DELETE. No location/vehicle/route permissions.

Join tables: user_roles, role_permissions.

### Copied: role.constants.ts and permission.constants.ts

--- begin api/src/constants/role.constants.ts ---
export enum RoleTypes {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER',
  DRIVER = 'DRIVER',
}

export enum RoleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
--- end role.constants.ts ---

--- begin api/src/constants/permission.constants.ts ---
export enum PermissionNames {
  TRIP_CREATE = 'TRIP_CREATE',
  TRIP_READ = 'TRIP_READ',
  TRIP_UPDATE = 'TRIP_UPDATE',
  TRIP_DELETE = 'TRIP_DELETE',
  USER_CREATE = 'USER_CREATE',
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
}
--- end permission.constants.ts ---

--- begin api/src/entities/role.entity.ts ---
import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './index';
import { UserRole } from './userRole.entity';
import { RoleStatus } from '../constants/role.constants';
import { RolePermission } from './rolePermission.entity';

@Entity('roles')
export class Role extends AbstractEntity {
  // NAME
  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  name: string;

  // DESCRIPTION
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    enum: RoleStatus,
    nullable: false,
    default: RoleStatus.ACTIVE,
  })
  status: RoleStatus;
  /**
   * RELATIONS
   */

  // USER ROLES
  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  // ROLE PERMISSIONS
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];
}
--- end role.entity.ts ---

--- begin api/src/entities/permission.entity.ts ---
import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './index';
import { PermissionNames } from '../constants/permission.constants';
import { RolePermission } from './rolePermission.entity';

@Entity('permissions')
export class Permission extends AbstractEntity {
  // NAME
  @Column({ type: 'enum', enum: PermissionNames, nullable: false })
  name: PermissionNames;

  // DESCRIPTION
  @Column({ type: 'varchar', nullable: true })
  description: string;

  // ROLE PERMISSIONS
  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission
  )
  rolePermissions: RolePermission[];
}
--- end permission.entity.ts ---

### 2.6 Audit tables (do not seed for demo data)

- audit_logs: entity-level CREATE/UPDATE/DELETE diffs (jsonb old/new)
- http_audit_logs: mutating HTTP requests
- logs: typed application logs

### 2.7 Entity relationship

users -- user_roles -- roles -- role_permissions -- permissions
users -- locations (created_by)
users -- trips (created_by, location_from, location_to)
trips -- user_trips (user, trip, entrance/exit geometry)
users -- transport_cards (created_by only)

No vehicle, driver-assignment, or route graph.


## 3. Existing seed files

Only RBAC plus one super-admin. No location/trip/GTFS fixtures. No SQL dumps. E2E test only hits GET / and landing-stats.

permissions.seed.ts: 8 PermissionNames rows
roles.seed.ts: 4 RoleTypes; all permissions to SUPER_ADMIN only
super-admin.seed.ts: info@basis.rw named Super Admin (password hardcoded in that file)

Order: permissions, then roles, then super-admin.
Gaps: USER ADMIN DRIVER get no permissions. No demo passenger, driver, locations, or trips.
Live landing stats: commutes 0, users 1.
--- begin api/src/seeds/permissions.seed.ts ---
import '../polyfills';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { PermissionNames } from '../constants/permission.constants';
import { AppModule } from '../app.module';
import { PermissionsService } from '../modules/roles/permissions.service';

export async function seedPermissions(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const permissionsService = app.get(PermissionsService);
    const permissionNames = Object.values(PermissionNames);

    for (const permissionName of permissionNames) {
      await permissionsService.createPermission({
        name: permissionName,
        description: `Permission for ${permissionName.toLowerCase().replace(/_/g, ' ')}`,
      });
    }

    console.log(`Seeded ${permissionNames.length} permissions.`);
  } finally {
    await app.close();
  }
}

async function run(): Promise<void> {
  try {
    await seedPermissions();
    process.exitCode = 0;
  } catch (error) {
    console.error('Failed to seed permissions:', error);
    process.exitCode = 1;
  }
}

void run();
--- end permissions.seed.ts ---

--- begin api/src/seeds/roles.seed.ts ---
import '../polyfills';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { In } from 'typeorm';
import { PermissionNames } from '../constants/permission.constants';
import { RoleTypes } from '../constants/role.constants';
import { AppModule } from '../app.module';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { RolePermissionService } from '../modules/roles/role-permission.service';
import { RolesService } from '../modules/roles/roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export async function seedRoles(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const roleService = app.get(RolesService);
    const rolePermissionService = app.get(RolePermissionService);
    const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
    const permissionRepository = app.get<Repository<Permission>>(
      getRepositoryToken(Permission)
    );

    const roleTypes = Object.values(RoleTypes);
    for (const roleName of roleTypes) {
      await roleService.createRole({
        name: roleName,
        description: `${roleName.replace(/_/g, ' ')} role`,
      });
    }

    const superAdminRole = await roleRepository.findOne({
      where: { name: RoleTypes.SUPER_ADMIN },
    });

    if (!superAdminRole) {
      throw new Error('SUPER_ADMIN role not found after role seeding');
    }

    const permissions = await permissionRepository.find({
      where: {
        name: In(Object.values(PermissionNames)),
      },
    });

    await rolePermissionService.assignPermissionsToRole({
      roleId: superAdminRole.id,
      permissions: permissions.map((permission) => permission.id),
    });

    console.log(
      `Seeded ${roleTypes.length} roles and assigned ${permissions.length} permissions to SUPER_ADMIN.`
    );
  } finally {
    await app.close();
  }
}

async function run(): Promise<void> {
  try {
    await seedRoles();
    process.exitCode = 0;
  } catch (error) {
    console.error('Failed to seed roles:', error);
    process.exitCode = 1;
  }
}

void run();
--- end roles.seed.ts ---

--- begin api/src/seeds/super-admin.seed.ts ---
import '../polyfills';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { UserStatus } from '../constants/user.constants';
import { RoleTypes } from '../constants/role.constants';
import { AppModule } from '../app.module';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/userRole.entity';
import { hashPassword } from '../helpers/encryptions.helper';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const SUPER_ADMIN_EMAIL = 'info@basis.rw';
const SUPER_ADMIN_PASSWORD = 'Test@123';
const SUPER_ADMIN_NAME = 'Super Admin';

export async function seedSuperAdmin(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
    const userRoleRepository = app.get<Repository<UserRole>>(
      getRepositoryToken(UserRole)
    );

    const superAdminRole = await roleRepository.findOne({
      where: { name: RoleTypes.SUPER_ADMIN },
    });

    if (!superAdminRole) {
      throw new Error('SUPER_ADMIN role not found. Run role seed first.');
    }

    const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);

    let superAdminUser = await userRepository.findOne({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    if (!superAdminUser) {
      superAdminUser = await userRepository.save({
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        passwordHash,
        status: UserStatus.ACTIVE,
      });
    } else {
      await userRepository.update(
        { id: superAdminUser.id },
        {
          name: superAdminUser.name || SUPER_ADMIN_NAME,
          passwordHash,
          status: UserStatus.ACTIVE,
        }
      );
    }

    const existingUserRole = await userRoleRepository.findOne({
      where: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    });

    if (!existingUserRole) {
      await userRoleRepository.save({
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      });
    }

    console.log(`Seeded super admin user: ${SUPER_ADMIN_EMAIL}.`);
  } finally {
    await app.close();
  }
}

async function run(): Promise<void> {
  try {
    await seedSuperAdmin();
    process.exitCode = 0;
  } catch (error) {
    console.error('Failed to seed super admin user:', error);
    process.exitCode = 1;
  }
}

void run();
--- end super-admin.seed.ts ---

## 4. How the API exposes routes / stops / search

Global prefix: /api (api/src/main.ts). Root GET / is excluded from the prefix.

There is no /routes, /stops, /vehicles, /search, or /health endpoint.

JWT is global. @Public() skips auth. @OptionalAuth() on nearby trips. @Roles(DRIVER, ADMIN, SUPER_ADMIN) on trip create/start/complete/cancel/update/delete.

--- begin api/src/main.ts (global prefix /api, port 8080) ---
import './polyfills';
import 'reflect-metadata';
import cluster from 'cluster';
import os from 'os';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import logger from './helpers/logger.helper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: false }));
  app.enableCors();
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) =>
          Object.values(error.constraints || {})
        );
        return new BadRequestException({
          message: messages[0] || 'Validation failed',
        });
      },
    })
  );

  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.success(`Worker ${process.pid} started on port ${port}`);
}

const useCluster = process.env.NODE_ENV === 'production';

if (useCluster && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  logger.info(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    logger.info(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  bootstrap().catch((error) => {
    logger.error('Failed to start NestJS application', error);
    process.exit(1);
  });
}
--- end main.ts ---
### Locations (stand-in for stops)

Controller: api/src/modules/locations/locations.controller.ts (@Controller locations)

POST /api/locations JWT create
GET /api/locations JWT paginated list. Query name uses ILike. Query description uses ILike and overwrites the name filter. page is 0-based, size default 10.
GET /api/locations/:id JWT
PATCH /api/locations/:id JWT
DELETE /api/locations/:id JWT 204

Client fetchLocations only passes page/size. The UI does not send the name search param.

--- begin api/src/modules/locations/locations.controller.ts ---
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { LocationService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';
import { CurrentUser } from '../../common/decorators/auth.decorators';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { UUID } from '../../types';
import { Location } from '../../entities/location.entity';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @HttpCode(201)
  async createLocation(
    @Body() body: CreateLocationDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const location = await this.locationService.createLocation({
      ...(body as Partial<Location>),
      createdById: user.id,
    });
    return {
      message: 'Location created successfully',
      data: location,
    };
  }

  @Get()
  async fetchLocations(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('name') name?: string,
    @Query('description') description?: string
  ) {
    let condition: FindOptionsWhere<Location> | FindOptionsWhere<Location>[] =
      {};

    if (name) {
      condition = [{ name: ILike(`%${name}%`) }];
    }

    if (description) {
      condition = [{ description: ILike(`%${description}%`) }];
    }

    const locations = await this.locationService.fetchLocations({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Locations fetched successfully',
      data: locations,
    };
  }

  @Get(':id')
  async getLocationById(@Param('id') id: string) {
    const location = await this.locationService.getLocationById(id as UUID);
    return {
      message: 'Location fetched successfully',
      data: location,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteLocation(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.locationService.deleteLocation(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Location deleted successfully',
    };
  }

  @Patch(':id')
  async updateLocation(
    @Param('id') id: string,
    @Body() body: UpdateLocationDto
  ) {
    const location = await this.locationService.updateLocation(
      id as UUID,
      body as Partial<Location>
    );
    return {
      message: 'Location updated successfully',
      data: location,
    };
  }
}
--- end locations.controller.ts ---
### Trips API

Controller: api/src/modules/trips/trips.controller.ts

GET /api/trips/nearby optional-auth geo search
GET /api/trips JWT list with filters
GET /api/trips/:id JWT by id
GET /api/trips/reference/:referenceId JWT
GET /api/trips/:id/capacity JWT
POST /api/trips operator roles create
PATCH start complete cancel and update: operator roles
DELETE /api/trips/:id operator roles
POST /api/trips/:tripId/entrance JWT boarding
POST /api/trips/:tripId/quick-join Public
--- begin api/src/modules/trips/trips.controller.ts ---
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { TripService } from './trips.service';
import { UserTripService } from '../user-trips/user-trips.service';
import {
  CreateTripDto,
  QuickJoinTripDto,
  RecordEntranceDto,
  UpdateTripDto,
} from './dto/trip.dto';
import {
  CurrentUser,
  OptionalAuth,
  Public,
  Roles,
} from '../../common/decorators/auth.decorators';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { UUID } from '../../types';
import { Trip } from '../../entities/trip.entity';
import { UserTrip } from '../../entities/userTrip.entity';
import { TripStatus } from '../../constants/trip.constants';
import { ValidationError } from '../../helpers/errors.helper';
import { RoleTypes } from '../../constants/role.constants';
import { isAdminLike } from '../../helpers/auth.helper';

const tripOperatorRoles = [
  RoleTypes.DRIVER,
  RoleTypes.ADMIN,
  RoleTypes.SUPER_ADMIN,
];

@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripService: TripService,
    private readonly userTripService: UserTripService
  ) {}

  @OptionalAuth()
  @Get('nearby')
  async fetchNearbyTrips(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('limit') limit = '5'
  ) {
    const parsedLat = lat !== undefined ? Number(lat) : undefined;
    const parsedLng = lng !== undefined ? Number(lng) : undefined;
    const parsedLimit = Number(limit);

    if (
      (lat !== undefined || lng !== undefined) &&
      (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng))
    ) {
      throw new ValidationError('lat and lng must be valid numbers');
    }

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      throw new ValidationError('limit must be a positive number');
    }

    const nearbyTrips = await this.tripService.fetchNearbyTrips({
      lat: parsedLat,
      lng: parsedLng,
      limit: Math.min(parsedLimit, 5),
    });

    return {
      message: 'Nearby trips fetched successfully',
      data: nearbyTrips,
    };
  }

  @Public()
  @Post(':tripId/quick-join')
  @HttpCode(201)
  async quickJoinTrip(
    @Param('tripId') tripId: string,
    @Body() body: QuickJoinTripDto
  ) {
    const result = await this.tripService.quickJoinTrip({
      tripId: tripId as UUID,
      phoneNumber: body.phoneNumber as string,
      entranceLocation: body.entranceLocation as {
        type: string;
        coordinates: number[];
      },
    });

    return {
      message: 'Trip joined successfully',
      data: result,
    };
  }

  @Roles(...tripOperatorRoles)
  @Post()
  @HttpCode(201)
  async createTrip(
    @Body() body: CreateTripDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const newTrip = await this.tripService.createTrip({
      ...(body as Partial<Trip>),
      createdById: user.id,
    });
    return {
      message: 'Trip created successfully',
      data: newTrip,
    };
  }

  @Get()
  async fetchTrips(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('status') status?: TripStatus,
    @Query('locationFromId') locationFromId?: string,
    @Query('locationToId') locationToId?: string,
    @Query('createdById') createdById?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string
  ) {
    const condition: FindOptionsWhere<Trip> | FindOptionsWhere<Trip>[] = {};

    if (status) {
      condition.status = status;
    }
    if (locationFromId) {
      condition.locationFromId = locationFromId as UUID;
    }
    if (locationToId) {
      condition.locationToId = locationToId as UUID;
    }
    if (createdById) {
      condition.createdById = createdById as UUID;
    }
    if (startTime && endTime) {
      condition.startTime = Between(new Date(startTime), new Date(endTime));
    } else if (startTime) {
      condition.startTime = MoreThanOrEqual(new Date(startTime));
    } else if (endTime) {
      condition.endTime = LessThanOrEqual(new Date(endTime));
    }

    const trips = await this.tripService.fetchTrips({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Trips fetched successfully',
      data: trips,
    };
  }

  @Get('reference/:referenceId')
  async getTripByReferenceId(@Param('referenceId') referenceId: string) {
    const trip = await this.tripService.getTripByReferenceId(referenceId);
    return {
      message: 'Trip fetched successfully',
      data: trip,
    };
  }

  @Post(':tripId/entrance')
  @HttpCode(201)
  async recordEntranceForTrip(
    @Param('tripId') tripId: string,
    @Body() body: RecordEntranceDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const resolvedUserId =
      isAdminLike(user) && body.userId ? (body.userId as UUID) : user.id;

    const newUserTrip = await this.userTripService.createUserTrip({
      ...(body as Partial<UserTrip>),
      tripId: tripId as UUID,
      userId: resolvedUserId,
      createdById: user.id,
    });

    return {
      message: 'Entrance recorded successfully',
      data: newUserTrip,
    };
  }

  @Get(':id/capacity')
  async countAvailableCapacity(@Param('id') id: string) {
    const { availableCapacity, totalCapacity } =
      await this.tripService.countAvailableCapacity(id as UUID);

    return {
      message: 'Available capacity counted successfully',
      data: { availableCapacity, totalCapacity },
    };
  }

  @Roles(...tripOperatorRoles)
  @Patch(':id/start')
  async startTrip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const trip = await this.tripService.startTrip(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Trip started successfully',
      data: trip,
    };
  }

  @Roles(...tripOperatorRoles)
  @Patch(':id/complete')
  async completeTrip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const trip = await this.tripService.completeTrip(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Trip completed successfully',
      data: trip,
    };
  }

  @Roles(...tripOperatorRoles)
  @Patch(':id/cancel')
  async cancelTrip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const trip = await this.tripService.cancelTrip(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Trip cancelled successfully',
      data: trip,
    };
  }

  @Roles(...tripOperatorRoles)
  @Patch(':id')
  async updateTrip(
    @Param('id') id: string,
    @Body() body: UpdateTripDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const updatedTrip = await this.tripService.updateTrip(id as UUID, {
      ...(body as Partial<Trip>),
      createdById: user.id,
    });
    return {
      message: 'Trip updated successfully',
      data: updatedTrip,
    };
  }

  @Roles(...tripOperatorRoles)
  @Delete(':id')
  @HttpCode(204)
  async deleteTrip(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.tripService.deleteTrip(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'Trip deleted successfully',
    };
  }

  @Get(':id')
  async getTripById(@Param('id') id: string) {
    const trip = await this.tripService.getTripById(id as UUID);
    return {
      message: 'Trip fetched successfully',
      data: trip,
    };
  }
}
--- end trips.controller.ts ---

Nearby algorithm (TripService.fetchNearbyTrips):
1. Load PENDING and IN_PROGRESS trips with locations.
2. If lat and lng given, order by PostGIS ST_Distance(locationFrom.address::geography, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography).
3. Fallback: haversine in JS if PostGIS fails; else recency; max 5.
This ranks by trip origin location, not by stop sequence or live vehicle. trips.current_location exists but is not used in nearby ranking.

### User trips
POST /api/user-trips and POST /api/user-trips/entrance board
POST /api/user-trips/:id/exit alight
GET /api/user-trips non-admins forced to own userId

### Other controllers
/ GET AppController public welcome
/api/auth/* signup login phone OTP password reset public
/api/users /api/roles JWT
/api/transport-cards owner or admin
/api/dashboard/public/landing-stats public
/api/audit-logs JWT

List payloads: { message, data: { rows, totalCount, totalPages, currentPage } }. Page is 0-based in query, 1-based in currentPage.
Client base URL: VITE_API_URL or http://localhost:8080/api

## 5. Live backend on port 8080 (GET only)

API node PID 6200 on *:8080. Vite node PID 6190 on *:5173.

| Request | Result |
|---|---|
| GET / | 200 Welcome to the Transport Management API |
| GET /health | 404 |
| GET /api | 404 |
| GET /api/health | 404 |
| GET /api/dashboard/public/landing-stats | 200 commutes 0 users 1 |
| GET /api/trips | 401 |
| GET /api/trips/nearby?lat=-1.9441&lng=30.0619 | 200 data empty list |
| GET /api/locations | 401 |
| GET /api/routes | 404 |
| GET /api/stops | 404 |
| GET /api/vehicles | 404 |
| GET /api/search | 404 |

Useful unauthenticated endpoints: GET /, GET /api/dashboard/public/landing-stats, GET /api/trips/nearby.

## 6. Package scripts related to seed / migrate

api/package.json scripts:
seed:permissions
seed:roles
seed:super-admin
seed (runs the three above in order)

No db:seed or migrate scripts. Client has only dev/build/lint/preview.
Schema changes ship by editing entities and restarting with synchronize true.
--- begin api/package.json scripts ---
{
  "name": "basis-transport-be",
  "version": "1.0.0",
  "description": "Backend of Basis Transport, a bus tracking and fleet management application",
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "nest start",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main.js",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "seed:permissions": "ts-node -r tsconfig-paths/register src/seeds/permissions.seed.ts",
    "seed:roles": "ts-node -r tsconfig-paths/register src/seeds/roles.seed.ts",
    "seed:super-admin": "ts-node -r tsconfig-paths/register src/seeds/super-admin.seed.ts",
    "seed": "npm run seed:permissions && npm run seed:roles && npm run seed:super-admin"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/basis-ltd/basis-transport-be.git"
  },
  "keywords": [
    "bus",
    "tracking"
  ],
  "author": "Nishimwe Prince",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/basis-ltd/basis-transport-be.git/issues"
  },
  "homepage": "https://github.com/basis-ltd/basis-transport-be#readme",
  "dependencies": {
    "@nestjs/common": "^10.4.22",
    "@nestjs/config": "^3.3.0",
    "@nestjs/core": "^10.4.22",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.4.22",
    "@nestjs/typeorm": "^10.0.2",
    "@react-email/components": "^1.0.11",
    "@react-email/render": "^2.0.5",
    "@types/express": "^5.0.6",
    "axios": "^1.14.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.2",
    "libphonenumber-js": "^1.12.41",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.15.6",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "reflect-metadata": "^0.2.2",
    "resend": "^6.10.0",
    "rxjs": "^7.8.2",
    "typeorm": "^0.3.22",
    "winston": "^3.17.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.9",
    "@nestjs/schematics": "^10.2.3",
    "@nestjs/testing": "^10.4.22",
    "@types/bcrypt": "^5.0.2",
    "@types/jest": "^29.5.14",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/node": "^22.14.0",
    "@types/passport-jwt": "^4.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@types/supertest": "^7.2.1",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^9.1.2",
    "eslint-plugin-prettier": "^5.5.6",
    "jest": "^29.7.0",
    "prettier": "^3.9.6",
    "source-map-support": "^0.5.21",
    "supertest": "^7.2.2",
    "ts-jest": "^29.4.12",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.8.3"
  }
}
--- end api.package.json ---

## 7. Gaps vs GTFS

Target GTFS files: agencies, routes, trips, stop_times, stops, calendar, shapes, fare_rules.

| GTFS | Basis today | Gap |
|---|---|---|
| agency.txt | Missing | No operator table. Roles DRIVER/ADMIN are users, not agencies. Card providers AC_GROUP and CENTRIKA only.
| stops.txt | locations (name, optional description, optional Point) | No stop_id/stop_code, location_type, parent_station, zone_id. Coords live inside geometry.
| routes.txt | Missing | A trip is a single OD pair, not a named line like 104F. No route_short_name, route_type, agency FK.
| trips.txt | trips table collides in name only | GTFS trip is a scheduled run of a route. Basis trip is an ad-hoc journey with capacity and live current_location.
| stop_times.txt | Missing | user_trips records passenger board/alight, not scheduled arrival at sequenced stops.
| calendar | Missing | start_time/end_time are actual timestamps of one instance.
| shapes.txt | Missing | Client uses Google Maps. No polylines stored.
| fare_rules | transport_cards only | Cards are identity tokens, not OD/zone fares.
| vehicles / GTFS-rt | trips.current_location | No vehicle entity, plate, occupancy. Ecofleet live payloads have nowhere to land.

Conceptual mismatch: GTFS is a network timetable. Basis is admin creates a trip from A to B, passengers join/exit with GPS. You cannot import Kigali GTFS or Ecofleet live routes without new tables (or a large, lossy squash into locations plus one trip per active vehicle).

Lossy squash if forced onto todays tables:
Each GTFS stop becomes a locations Point row.
Each active vehicle becomes one trips row (from=nearest stop, to=destination, status IN_PROGRESS).
Route name, stop sequence, calendar, fares, and shapes are dropped.
Nearby search ranks by origin location, not vehicle position.

## 8. What a seed must populate today

No new entities. Fill tables that already exist.
1. RBAC (permissions, roles, super admin) already covered by existing seed scripts. Also grant trip permissions to ADMIN and DRIVER.
2. Locations (required FK for trips). At least two Kigali Points as GeoJSON [lng, lat], SRID 4326.
Remera: 30.11989, -1.96061
Downtown: 30.05725, -1.94356
created_by_id = super admin UUID.
3. Trips: locationFromId, locationToId, totalCapacity around 30-50. One PENDING and one IN_PROGRESS so nearby and join work. reference_id is auto-generated by TripService.createTrip (TRIP-xxxxx). Optional current_location Point. Set start_time on in-progress trips.
4. Extra users (optional): a DRIVER (trip create/start is role-gated) and 1-2 USER passengers so user_trips and dashboard commutes are non-zero. Phone numbers in E.164 (+250...) if testing quick-join.
5. User trips (optional): passenger on the in-progress trip, entrance_location Point required, status IN_PROGRESS. Capacity math subtracts in-progress user_trips from total_capacity.
6. Transport cards (optional): card_number plus provider AC_GROUP or CENTRIKA, created_by_id = passenger.

Do not seed audit_logs, http_audit_logs, logs.
Cannot seed without schema work: agencies, routes, stop sequences, calendars, shapes, fare rules, vehicles/plates.

Suggested new seed file (not written; this inspection is read-only): api/src/seeds/kigali-demo.seed.ts after the existing seed. Use Location and Trip repositories. Keep synchronize true so geometry columns exist; PostGIS must be enabled on basis_transport.

Minimal viable demo graph:
SUPER_ADMIN info@basis.rw
DRIVER optional
USER passenger(s)
locations: Remera Point -- trip IN_PROGRESS capacity 40 --> Downtown Point
locations: Kimironko -- trip PENDING --> Downtown
user_trips: passenger boarded Remera to Downtown

After that, GET /api/trips/nearby with Remera coords should return the in-progress trip, and landing-stats commutes/users become non-zero.

## 9. File index

Entities under api/src/entities/: abstract, location, trip, userTrip, transportCard, user, role, permission, userRole, rolePermission, auditLog, httpAuditLog, log.

DB/config: api/src/database/database.module.ts, api/src/config/configuration.ts, api/src/config/env.validation.ts, api/.env.example

Controllers: locations, trips, user-trips, auth, users, roles, transport-cards, dashboard, audit-logs. DTOs: location.dto.ts, trip.dto.ts, geo-point.dto.ts. Prefix in api/src/main.ts.

Seeds: api/src/seeds/permissions.seed.ts, roles.seed.ts, super-admin.seed.ts. Scripts in api/package.json.

Client mirrors: client/src/types/location.type.ts, trip.type.ts, userTrip.type.ts; client/src/api/queries/apiQuerySlice.ts; client/src/api/mutations/apiSlice.ts

Copied snippets on the box: /workspace/ecofleet/snippets/

## 10. Schema-improvement notes (for later, not done)

If the goal is Ecofleet/GTFS-shaped Kigali data:
Add tables for agencies, routes, stops (or extend locations), route_stops, shapes, calendar, scheduled_trips, vehicles, vehicle_positions, fares.
Keep current trips and user_trips as operational instances linked to route_id and vehicle_id.
Turn off synchronize and add migrations.
Add GET /api/routes, GET /api/stops, GET /api/health, and nearby search by vehicle or nearest stop.
Grant trip permissions to DRIVER and ADMIN, not only SUPER_ADMIN.

Until those exist, a seed can only fill locations, ad-hoc trips, passengers, and RBAC.

## Appendix: copied user.entity.ts
--- begin api/src/entities/user.entity.ts ---
import { IsEmail, IsNotEmpty } from 'class-validator';
import { AbstractEntity } from './index';
import { Column, Entity, OneToMany } from 'typeorm';
import { COUNTRIES } from '../constants/countries.constants';
import { UserRole } from './userRole.entity';
import { Gender, UserStatus } from '../constants/user.constants';
import { TransportCard } from './transportCard.entity';

@Entity('users')
export class User extends AbstractEntity {
  // NAME
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  @IsNotEmpty({ message: 'Name is required' })
  name?: string;

  // EMAIL
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  // PHONE
  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  phoneNumber?: string;

  // PROFILE COMPLETION
  @Column({
    name: 'is_profile_complete',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isProfileComplete: boolean;

  // GENDER
  @Column({
    name: 'gender',
    type: 'enum',
    nullable: true,
    enum: Gender,
    default: Gender.MALE,
  })
  gender?: Gender;

  // DATE OF BIRTH
  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: true,
    default: UserStatus.ACTIVE,
    enum: UserStatus,
  })
  status: UserStatus;

  // NATIONALITY
  @Column({
    name: 'nationality',
    type: 'enum',
    nullable: true,
    default: 'RW',
    enum: COUNTRIES.map((country) => country.code),
  })
  nationality?: string;

  // PASSWORD HASH
  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  passwordHash?: string;

  // HAS SET PASSWORD
  @Column({
    name: 'has_set_password',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  hasSetPassword: boolean;

  // PHONE OTP (stored as SHA-256 hash of OTP)
  @Column({
    name: 'phone_otp_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
    select: false,
  })
  phoneOtpHash?: string | null;

  @Column({
    name: 'phone_otp_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  phoneOtpExpiresAt?: Date | null;

  @Column({
    name: 'phone_otp_attempts',
    type: 'int',
    nullable: false,
    default: 0,
  })
  phoneOtpAttempts: number;

  @Column({
    name: 'phone_otp_last_sent_at',
    type: 'timestamp',
    nullable: true,
  })
  phoneOtpLastSentAt?: Date | null;

  @Column({
    name: 'temporary_auth_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  temporaryAuthExpiresAt?: Date | null;

  // PHONE PASSWORD RESET OTP (stored as SHA-256 hash)
  @Column({
    name: 'phone_reset_otp_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
    select: false,
  })
  phoneResetOtpHash?: string | null;

  @Column({
    name: 'phone_reset_otp_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  phoneResetOtpExpiresAt?: Date | null;

  @Column({
    name: 'phone_reset_otp_attempts',
    type: 'int',
    nullable: false,
    default: 0,
  })
  phoneResetOtpAttempts: number;

  @Column({
    name: 'phone_reset_otp_last_sent_at',
    type: 'timestamp',
    nullable: true,
  })
  phoneResetOtpLastSentAt?: Date | null;

  @Column({
    name: 'phone_reset_session_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
    select: false,
  })
  phoneResetSessionHash?: string | null;

  @Column({
    name: 'phone_reset_session_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  phoneResetSessionExpiresAt?: Date | null;

  // TRANSIENT AUTH FLAG (API RESPONSE ONLY)
  mustCompleteRegistration?: boolean;

  // PASSWORD RESET (token stored as SHA-256 hex of raw token)
  @Column({
    name: 'password_reset_token_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
    select: false,
  })
  passwordResetTokenHash?: string;

  @Column({
    name: 'password_reset_expires',
    type: 'timestamp',
    nullable: true,
  })
  passwordResetExpires?: Date;

  /**
   * RELATIONS
   */

  // USER ROLES
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  // TRANSPORT CARDS
  @OneToMany(() => TransportCard, (transportCard) => transportCard.createdBy)
  transportCards: TransportCard[];
}
--- end user.entity.ts ---
