import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../data-source';
import { NotFoundError } from '../helpers/errors.helper';
import { LogReferenceTypes } from '../constants/logs.constants';
import { AuditDelete } from '../decorators/auditLog.decorator';
import { UUID } from '../types';
import { getPagingData } from '../helpers/pagination.helper';
import { getPagination, Pagination } from '../helpers/pagination.helper';

export class UserService {
  private readonly userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
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
    });

    if (!user) {
      throw new NotFoundError('User not found', {
        referenceId: id,
        referenceType: LogReferenceTypes.USER,
      });
    }

    return user;
  }
}
