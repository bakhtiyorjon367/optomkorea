import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class TelegramLoginDto {
  @Transform(({ value }) => String(value))
  @IsString()
  @IsNotEmpty()
  id!: string;

  @Transform(({ value }) => String(value))
  @IsString()
  @IsNotEmpty()
  auth_date!: string;

  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsOptional()
  @IsString()
  language_code?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : String(value)))
  @IsString()
  allows_write_to_pm?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : String(value)))
  @IsString()
  is_premium?: string;

  @IsString()
  @IsNotEmpty()
  hash!: string;
}

export class TelegramWebAppLoginDto {
  @IsString()
  @IsNotEmpty()
  initData!: string;
}
