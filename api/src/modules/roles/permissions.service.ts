import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity';
import { NotFoundError } from '../../helpers/errors.helper';
import { getPagingData, Pagination } from '../../helpers/pagination.helper';
import { getPagination } from '../../helpers/pagination.helper';
import { UUID } from '../../types';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  /**
   * CREATE PERMISSION
   */
  async createPermission(permission: Partial<Permission>): Promise<Permission> {
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
