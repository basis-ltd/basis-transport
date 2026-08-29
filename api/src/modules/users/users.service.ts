import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ConflictError, NotFoundError } from '../../helpers/errors.helper';
import { LogReferenceTypes } from '../../constants/logs.constants';
import { UUID } from '../../types';
import { getPagingData } from '../../helpers/pagination.helper';
import { getPagination, Pagination } from '../../helpers/pagination.helper';
import { Role } from '../../entities/role.entity';
import { generateRandomString } from '../../helpers/string.helper';
import { hashPassword } from '../../helpers/encryptions.helper';
import { UserRole } from '../../entities/userRole.entity';
import { EmailService } from '../../integrations/email/email.service';
import { renderUserWelcomeHtml } from '../../emails/renderEmails';
import { AppConfig } from '../../config/config.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService<AppConfig, true>
  ) {}

  /**
   * DELETE USER
   * @param id
   * @returns
   */
  async deleteUser(
    id: UUID,
    _metadata?: { createdById?: UUID }
  ): Promise<void> {
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
      },
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

    const clientUrl = this.config
      .get('clientAppUrl', { infer: true })
      .replace(/\/$/, '');

    const htmlContent = await renderUserWelcomeHtml({
      userName: newUser.name,
      password,
      loginUrl: `${clientUrl}/auth/login`,
      year: new Date().getFullYear(),
    });

    await this.emailService.send({
      to: newUser.email as string,
      subject: 'Welcome to Basis Transport',
      html: htmlContent,
    });

    // RETURN NEW USER
    return newUser;
  }
}
