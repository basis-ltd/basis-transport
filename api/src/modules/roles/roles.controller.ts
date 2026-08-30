import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { RolesService } from './roles.service';
import { UUID } from '../../types';
import { Role } from '../../entities/role.entity';
import { RoleStatus } from '../../constants/role.constants';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Get()
  async fetchRoles(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Query('name') name?: string,
    @Query('status') status?: RoleStatus
  ) {
    let condition: FindOptionsWhere<Role> | FindOptionsWhere<Role>[] = {};

    if (status) {
      condition.status = status;
    }

    if (name) {
      condition = [{ name: ILike(`%${name}%`) }];
    }

    const roles = await this.roleService.fetchRoles({
      page: Number(page),
      size: Number(size),
      condition,
    });

    return {
      message: 'Roles fetched successfully',
      data: roles,
    };
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    const role = await this.roleService.getRoleById(id as UUID);
    return {
      message: 'Role fetched successfully',
      data: role,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteRole(@Param('id') id: string) {
    await this.roleService.deleteRole(id as UUID);
    return {
      message: 'Role deleted successfully',
    };
  }

  @Post()
  @HttpCode(201)
  async createRole(@Body() body: Partial<Role>) {
    const newRole = await this.roleService.createRole(body);
    return {
      message: 'Role created successfully',
      data: newRole,
    };
  }
}
