import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { RolePermission } from '../../entities/rolePermission.entity';
import { RolesController } from './roles.controller';
import { RoleService } from '../../services/role.service';
import { PermissionsService } from '../../services/permissions.service';
import { RolePermissionService } from '../../services/rolePermission.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  controllers: [RolesController],
  providers: [RoleService, PermissionsService, RolePermissionService],
  exports: [RoleService, PermissionsService, RolePermissionService],
})
export class RolesModule {}
