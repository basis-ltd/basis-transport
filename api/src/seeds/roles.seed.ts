import { In } from 'typeorm';
import { PermissionNames } from '../constants/permission.constants';
import { RoleTypes } from '../constants/role.constants';
import { AppDataSource } from '../data-source';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { RolePermissionService } from '../services/rolePermission.service';
import { RoleService } from '../services/role.service';

export async function seedRoles(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const roleService = new RoleService();
  const rolePermissionService = new RolePermissionService();
  const roleRepository = AppDataSource.getRepository(Role);
  const permissionRepository = AppDataSource.getRepository(Permission);

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
}

async function run(): Promise<void> {
  try {
    await seedRoles();
    process.exitCode = 0;
  } catch (error) {
    console.error('Failed to seed roles:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void run();
