import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsIn(['admin_gave', 'manager_paid'])
  type!: 'admin_gave' | 'manager_paid';

  @IsMongoId()
  @IsNotEmpty()
  managerId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  transactionDate?: string;
}
