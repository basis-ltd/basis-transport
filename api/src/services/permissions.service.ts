import { FindOptionsWhere, Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Permission } from '../entities/permission.entity';
import { NotFoundError, ValidationError } from '../helpers/errors.helper';
import { validateCreatePermission } from '../validations/permission.validations';
import { getPagingData, Pagination } from '../helpers/pagination.helper';
import { getPagination } from '../helpers/pagination.helper';
import { UUID } from '../types';

export class PermissionsService {
  private readonly permissionRepository: Repository<Permission>;

  constructor() {
    this.permissionRepository = AppDataSource.getRepository(Permission);
  }

  /**
   * CREATE PERMISSION
   */
  async createPermission(permission: Partial<Permission>): Promise<Permission> {
    // VALIDATE PERMISSION
    const { error } = validateCreatePermission(permission);
    if (error) {
      throw new ValidationError(error.message);
    }

    // CHECK IF PERMISSION EXISTS
    const permissionExists = await this.permissionRepository.findOne({
      where: { name: permission?.name },
    });

    // IF PERMISSION EXISTS, RETURN IT
    if (permissionExists) {
      return permissionExists;
    }

    // CREATE PERMISSION
    return this.permissionRepository.save(permission);
  }

  /**
   * FETCH PERMISSIONS
   */
  async fetchPermissions({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<Permission> | FindOptionsWhere<Permission>[];
  }): Promise<Pagination<Permission>> {
    // GET PAGINATION
    const { take, skip } = getPagination({ page, size });

    // FETCH PERMISSIONS
    const permissions = await this.permissionRepository.findAndCount({
      take,
      skip,
      where: condition,
    });

    // RETURN PAGINATION
    return getPagingData({ data: permissions, page, size });
  }

  // GET PERMISSION BY ID
  async getPermissionById(id: UUID): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    // IF PERMISSION DOES NOT EXIST, THROW ERROR
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    // RETURN PERMISSION
    return permission;
  }
}
