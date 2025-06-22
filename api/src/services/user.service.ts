import { FindOptionsWhere, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../data-source';
import { ConflictError, NotFoundError } from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';
import { AuditDelete } from '../decorators/auditLog.decorator';
import { UUID } from '../types';
import { getPagingData } from '../helpers/pagination.helper';
import { getPagination, Pagination } from '../helpers/pagination.helper';
import { Role } from '../entities/role.entity';
import { generateRandomString } from '../helpers/string.helper';
import { hashPassword } from '../helpers/encryptions.helper';
import { UserRole } from '../entities/userRole.entity';
import { userCreatedTemplate } from '../templates/user.template';
import { sendEmail } from '../helpers/emails.helper';

export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly roleRepository: Repository<Role>;
  private readonly userRoleRepository: Repository<UserRole>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.userRoleRepository = AppDataSource.getRepository(UserRole);
  }

  /**
   * DELETE USER
   * @param id
   * @returns
   */
  @AuditDelete({
    entityType: 'User',
    getEntityId: (args) => args[0],
    getUserId: (args) => args[1]?.createdById,
  })
  async deleteUser(id: UUID, metadata?: { createdById?: UUID }): Promise<void> {
    // CHECK IF USER EXISTS
    const existingUser = await this.userRepository.findOne({
      where: { id: id as UUID },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.USER,
      });
    }

    // DELETE USER
    await this.userRepository.delete(id);
  }

  /**
   * FETCH USERS
   * @param page
   * @param limit
   * @returns
   */
  async fetchUsers({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<User> | FindOptionsWhere<User>[];
  }): Promise<Pagination<User>> {
    // GET PAGINATION
    const { take, skip } = getPagination({ page, size });

    const users = await this.userRepository.findAndCount({
      skip,
      take,
      where: condition,
      relations: {
        userRoles: {
          role: true,
        },
      },
      order: {
        updatedAt: 'DESC',
      }
    });

    return getPagingData({
      data: users,
      page,
      size,
    });
  }

  /**
   * GET USER BY ID
   * @param id
   * @returns
   */
  async getUserById(id: UUID): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: id as UUID },
      relations: {
        userRoles: {
          role: true,
        },
        transportCards: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.USER,
      });
    }

    return user;
  }

  /**
   * CREATE USER
   */
  async createUser({
    user,
    roleIds,
  }: {
    user: Partial<User>;
    roleIds: UUID[];
  }): Promise<User> {
    // CHECK IF ROLE EXISTS
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundError('Role not found', {
        referenceType: LogReferenceTypes.ROLE,
      });
    }

    // CHECK IF USER ALREADY EXISTS
    const existingUser = await this.userRepository.findOne({
      where: { email: user?.email },
    });

    if (existingUser) {
      throw new ConflictError('User already exists', {
        referenceId: user?.email,
        referenceType: LogReferenceTypes.USER,
      });
    }

    /**
     * CREATE USER
     */

    // GENERATE PASSWORD
    const password = generateRandomString();

    // HASH PASSWORD
    const hashedPassword = await hashPassword(password);

    // CREATE USER
    const newUser = await this.userRepository.save({
      ...user,
      passwordHash: hashedPassword,
    });

    // CREATE USER ROLE
    await Promise.all(
      roles.map(async (role) => {
        await this.userRoleRepository.save({
          userId: newUser.id,
          roleId: role.id,
        });
      })
    );

    // SEND EMAIL
    await sendEmail({
      toEmail: newUser.email as string,
      subject: 'Welcome to the platform',
      htmlContent: userCreatedTemplate({ user: newUser, password }),
    });

    // RETURN NEW USER
    return newUser;
  }
}
