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
import { FindOptionsWhere } from 'typeorm';
import { UsersService } from './users.service';
import { CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import { RoleTypes } from '../../constants/role.constants';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { UUID } from '../../types';
import { User } from '../../entities/user.entity';

@Controller('users')
@Roles(RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async fetchUsers(@Query('page') page = 0, @Query('size') size = 10) {
    const condition: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};
    const users = await this.userService.fetchUsers({
      page: Number(page),
      size: Number(size),
      condition,
    });
    return {
      message: 'Users fetched successfully',
      data: users,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id as UUID);
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.userService.deleteUser(id as UUID, {
      createdById: user.id,
    });
    return {
      message: 'User deleted successfully',
    };
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() body: { user: Partial<User>; roleIds: UUID[] }) {
    const newUser = await this.userService.createUser(body);
    return {
      message: 'User created successfully',
      data: newUser,
    };
  }
}
