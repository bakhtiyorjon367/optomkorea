import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async loginWithPassword(username: string, password: string) {
    const user = await this.usersService.validatePassword(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const token = await this.jwtService.signAsync({
      sub: String(user._id),
      role: user.role,
    });

    return {
      token,
      user: {
        id: String(user._id),
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },
    };
  }

  async loginWithTelegram(payload: Record<string, unknown>) {
    const id = this.getRequiredString(payload, 'id');
    const firstName = this.getRequiredString(payload, 'first_name');
    const lastName = this.getOptionalString(payload, 'last_name');
    const username = this.getOptionalString(payload, 'username');

    this.verifyTelegramSignature(payload);

    const user = await this.usersService.upsertFromTelegram({
      telegramId: Number(id),
      firstName,
      lastName,
      username,
    });

    if (!user) {
      throw new UnauthorizedException('Unable to authenticate user');
    }

    const token = await this.jwtService.signAsync({
      sub: String(user._id),
      role: user.role,
    });

    return {
      token,
      user: {
        id: String(user._id),
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },
    };
  }

  private verifyTelegramSignature(payload: Record<string, unknown>): void {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new BadRequestException('TELEGRAM_BOT_TOKEN is not configured');
    }

    const payloadEntries = Object.entries(payload).filter(([key, value]) => {
      if (key === 'hash') return false;
      return value !== undefined && value !== null && String(value) !== '';
    });

    const dataCheckString = payloadEntries
      .map(([key, value]) => `${key}=${String(value)}`)
      .sort()
      .join('\n');

    const secretKey = createHash('sha256').update(botToken).digest();
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    const providedHash = this.getRequiredString(payload, 'hash');

    const isValid =
      providedHash.length === computedHash.length &&
      timingSafeEqual(
        Buffer.from(providedHash, 'utf8'),
        Buffer.from(computedHash, 'utf8'),
      );

    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram login signature');
    }
  }

  private getRequiredString(
    payload: Record<string, unknown>,
    key: string,
  ): string {
    const value = payload[key];
    if (value === undefined || value === null || String(value) === '') {
      throw new BadRequestException(`${key} is required`);
    }
    return String(value);
  }

  private getOptionalString(
    payload: Record<string, unknown>,
    key: string,
  ): string | undefined {
    const value = payload[key];
    if (value === undefined || value === null || String(value) === '') {
      return undefined;
    }
    return String(value);
  }
}
