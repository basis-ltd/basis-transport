import '../polyfills';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { PermissionNames } from '../constants/permission.constants';
import { AppModule } from '../app.module';
import { PermissionsService } from '../services/permissions.service';

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
