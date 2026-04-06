import { UserStatus } from '../constants/user.constants';
import { RoleTypes } from '../constants/role.constants';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/userRole.entity';
import { hashPassword } from '../helpers/encryptions.helper';

const SUPER_ADMIN_EMAIL = 'info@basis.rw';
const SUPER_ADMIN_PASSWORD = 'Test@123';
const SUPER_ADMIN_NAME = 'Super Admin';

export async function seedSuperAdmin(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const userRepository = AppDataSource.getRepository(User);
  const roleRepository = AppDataSource.getRepository(Role);
  const userRoleRepository = AppDataSource.getRepository(UserRole);

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
}

async function run(): Promise<void> {
  try {
    await seedSuperAdmin();
    process.exitCode = 0;
  } catch (error) {
    console.error('Failed to seed super admin user:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void run();
