import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateShipmentDto {
  @IsMongoId()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantityTotal!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costKrwTotal?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
