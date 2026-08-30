import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TripStatus } from '../../../constants/trip.constants';
import { GeoPointDto } from '../../../common/dto/geo-point.dto';

export class CreateTripDto {
  @IsUUID()
  locationFromId: string;

  @IsOptional()
  @IsUUID()
  locationToId?: string;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsNumber()
  totalCapacity?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  currentLocation?: GeoPointDto;
}

export class UpdateTripDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  currentLocation?: GeoPointDto;

  @IsOptional()
  @IsUUID()
  locationToId?: string;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsNumber()
  totalCapacity?: number;

  @IsOptional()
  @IsUUID()
  locationFromId?: string;
}

export class QuickJoinTripDto {
  @IsString()
  phoneNumber: string;

  @ValidateNested()
  @Type(() => GeoPointDto)
  entranceLocation: GeoPointDto;
}

export class RecordEntranceDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ValidateNested()
  @Type(() => GeoPointDto)
  entranceLocation: GeoPointDto;
}
