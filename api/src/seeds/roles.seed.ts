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
        name: In(Object.values(PermissionNames).filter(name => !name.startsWith('TRIP_'))),
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
