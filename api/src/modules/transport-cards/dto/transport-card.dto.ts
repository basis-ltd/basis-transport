import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransportCardProvider } from '../../../constants/transportCard.constants';

export class CreateTransportCardDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsString()
  cardNumber: string;

  @IsOptional()
  @IsEnum(TransportCardProvider)
  provider?: TransportCardProvider | null;
}

export class UpdateTransportCardDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsEnum(TransportCardProvider)
  provider?: TransportCardProvider | null;
}
