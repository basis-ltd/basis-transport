import { PermissionNames } from '../constants/permission.constants';
import { AppDataSource } from '../data-source';
import { PermissionsService } from '../services/permissions.service';

export async function seedPermissions(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const permissionsService = new PermissionsService();
  const permissionNames = Object.values(PermissionNames);

  for (const permissionName of permissionNames) {
    await permissionsService.createPermission({
      name: permissionName,
      description: `Permission for ${permissionName.toLowerCase().replace(/_/g, ' ')}`,
    });
  }

  console.log(`Seeded ${permissionNames.length} permissions.`);
}

async function run(): Promise<void> {
  try {
    await seedPermissions();
    process.exitCode = 0;
  } catch (error) {
    console.error('Failed to seed permissions:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void run();
