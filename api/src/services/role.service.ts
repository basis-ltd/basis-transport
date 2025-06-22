import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { AppDataSource } from '../data-source';
import { UUID } from '../types';
import { NotFoundError } from '../helpers/errors.helper';
import { RoleTypes } from '../constants/role.constants';
import {
  getPagination,
  getPagingData,
  Pagination,
} from '../helpers/pagination.helper';

export class RoleService {
  private readonly roleRepository: Repository<Role>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  // CREATE ROLE
  async createRole(role: Partial<Role>): Promise<Role> {
    // CHECK IF ROLE EXISTS
    const existingRole = await this.roleRepository.findOne({
      where: { name: role?.name },
    });

    if (existingRole) {
      return existingRole;
    }

    // CREATE ROLE
    return this.roleRepository.save(role);
  }

  // GET ROLE BY ID
  async getRoleById(id: UUID): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    return role;
  }

  // GET ROLES BY NAMES
  async getRolesByNames(names: Partial<RoleTypes>[]): Promise<Role[]> {
    return this.roleRepository.find({
      where: { name: In(names) },
    });
  }

  // FETCH ROLES
  async fetchRoles({
    page,
    size,
    condition,
  }: {
    page: number;
    size: number;
    condition: FindOptionsWhere<Role> | FindOptionsWhere<Role>[];
  }): Promise<Pagination<Role>> {
    // GET PAGINATION
    const { take, skip } = getPagination({ page, size });

    const roles = await this.roleRepository.findAndCount({
      skip,
      take,
      where: condition,
    });

    return getPagingData({ data: roles, page, size });
  }

  // DELETE ROLE
  async deleteRole(id: UUID): Promise<void> {
    // CHECK IF ROLE EXISTS
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // DELETE ROLE
    await this.roleRepository.delete(id);
  }
}
