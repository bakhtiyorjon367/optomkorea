import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class UpsertTelegramUserDto {
  telegramId!: number;
  username?: string;
  firstName!: string;
  lastName?: string;
}
