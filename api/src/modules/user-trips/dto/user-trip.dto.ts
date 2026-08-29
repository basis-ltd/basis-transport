import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { UserTripStatus } from '../../../constants/userTrip.constants';
import { GeoPointDto } from '../../../common/dto/geo-point.dto';

export class CreateUserTripDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsUUID()
  tripId: string;

  @ValidateNested()
  @Type(() => GeoPointDto)
  entranceLocation: GeoPointDto;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsEnum(UserTripStatus)
  status?: UserTripStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  exitLocation?: GeoPointDto;
}

export class UpdateUserTripDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsEnum(UserTripStatus)
  status?: UserTripStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  exitLocation?: GeoPointDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  entranceLocation?: GeoPointDto;
}

export class RecordExitDto {
  @ValidateNested()
  @Type(() => GeoPointDto)
  exitLocation: GeoPointDto;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;
}
