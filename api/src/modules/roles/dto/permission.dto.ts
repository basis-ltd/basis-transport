import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PermissionNames } from '../../../constants/permission.constants';

export class CreatePermissionDto {
  @IsEnum(PermissionNames)
  name: PermissionNames;

  @IsOptional()
  @IsString()
  description?: string;
}
