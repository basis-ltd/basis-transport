import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsString,
} from 'class-validator';

export class GeoPointDto {
  @IsString()
  @IsIn(['Point'])
  type: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  coordinates: number[];
}
