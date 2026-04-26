import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ReceiveProductDto {
  @IsMongoId()
  @IsNotEmpty()
  shipmentId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}
