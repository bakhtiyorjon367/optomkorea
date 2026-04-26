import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../../libs/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async telegramLogin(@Body() payload: Record<string, unknown>) {
    const result = await this.authService.loginWithTelegram(payload);
    return { data: result };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.loginWithPassword(
      dto.username,
      dto.password,
    );
    return { data: result };
  }
}
