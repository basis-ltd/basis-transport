import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class JourneyLocationDto {
  @IsOptional() @IsString() @Length(1, 100) stopId?: string;
  @IsOptional() @IsNumber() @Min(-90) @Max(90) latitude?: number;
  @IsOptional() @IsNumber() @Min(-180) @Max(180) longitude?: number;
}
export class PlanJourneyDto {
  @ValidateNested() @Type(() => JourneyLocationDto) origin: JourneyLocationDto;
  @ValidateNested()
  @Type(() => JourneyLocationDto)
  destination: JourneyLocationDto;
  @IsOptional() @IsInt() @Min(0) @Max(2) maxTransfers = 2;
  @IsOptional() @IsInt() @Min(100) @Max(2000) maxWalkMeters = 800;
  @IsOptional() @IsIn(['fewest_transfers', 'least_walking']) preference:
    'fewest_transfers' | 'least_walking' = 'fewest_transfers';
}
export class NetworkQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) page = 0;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) size = 20;
  @IsOptional() @IsString() @MaxLength(100) q?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(-90) @Max(90) lat?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(100) @Max(5000) radius = 1000;
}
export class SavedItemDto {
  @IsString() @Length(1, 100) key: string;
  @IsString() @Length(1, 200) label: string;
  @IsString() @Length(1, 2000) href: string;
  @IsIn(['journey', 'stop', 'route']) kind: 'journey' | 'stop' | 'route';
}
export class ReportDto {
  @IsIn(['contact', 'route', 'stop']) kind: 'contact' | 'route' | 'stop';
  @IsOptional() @IsString() @MaxLength(100) referenceId?: string;
  @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsString() @Length(10, 3000) message: string;
  @IsOptional() @IsString() @MaxLength(100) website?: string; // honeypot
}
export class ReviewReportDto {
  @IsIn(['open', 'resolved']) status: 'open' | 'resolved';
}
export class DatasetMetadataDto {
  @IsOptional() @IsIn(['historic', 'unverified', 'verified']) verification?:
    'historic' | 'unverified' | 'verified';
  @IsOptional() @IsIn(['unclear', 'approved']) rightsStatus?:
    'unclear' | 'approved';
  @IsOptional() @IsString() @MaxLength(3000) rightsEvidence?: string;
  @IsOptional() @IsString() @MaxLength(3000) verificationEvidence?: string;
}
export class PublishDto {
  @IsBoolean() confirm: boolean;
}
export class DraftSnapshotDto {
  @IsArray() patterns: unknown[];
  @IsArray() transfers: unknown[];
}
