import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RolePermission } from '../entities/rolePermission.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { NotFoundError } from '../helpers/errors.helper';
import { UUID } from '../types';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  // CREATE ROLE PERMISSION
  async createRolePermission(
    rolePermission: Partial<RolePermission>
  ): Promise<RolePermission> {
    // CHECK IF ROLE PERMISSION EXISTS
    const existingRolePermission = await this.rolePermissionRepository.findOne({
      where: {
        roleId: rolePermission?.roleId,
        permissionId: rolePermission?.permissionId,
      },
    });

    // IF ROLE PERMISSION EXISTS, RETURN IT
    if (existingRolePermission) {
      return existingRolePermission;
    }

    // CHECK IF ROLE EXISTS
    const role = await this.roleRepository.findOne({
      where: { id: rolePermission?.roleId },
    });

    // CHECK IF ROLE EXISTS
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // CHECK IF PERMISSION EXISTS
    const permission = await this.permissionRepository.findOne({
      where: { id: rolePermission?.permissionId },
    });

    // IF ROLE OR PERMISSION DOES NOT EXIST, THROW ERROR
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    // CREATE ROLE PERMISSION
    return this.rolePermissionRepository.save(rolePermission);
  }

  /**
   * ASSIGN PERMISSIONS TO ROLE
   */
  async assignPermissionsToRole({
    roleId,
    permissions,
  }: {
    roleId: UUID;
    permissions: UUID[];
  }): Promise<void> {
    // CHECK IF ROLE EXISTS
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    // CHECK IF ROLE EXISTS
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // CHECK IF PERMISSIONS EXIST
    const permissionsExist = await this.permissionRepository.find({
      where: { id: In(permissions) },
    });

    // IF PERMISSIONS DO NOT EXIST, THROW ERROR
    if (permissionsExist.length !== permissions.length) {
      throw new NotFoundError('One or more permissions not found');
    }

    // ASSIGN PERMISSIONS TO ROLE
    await Promise.all(
      permissionsExist.map((permission) =>
        this.createRolePermission({
          roleId,
          permissionId: permission.id,
        })
      )
    );

    // RETURN SUCCESS
    return;
  }
}
