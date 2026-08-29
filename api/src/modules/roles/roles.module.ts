import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { RolePermission } from '../../entities/rolePermission.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { RolePermissionService } from './role-permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  controllers: [RolesController],
  providers: [RolesService, PermissionsService, RolePermissionService],
  exports: [RolesService, PermissionsService, RolePermissionService],
})
export class RolesModule {}
