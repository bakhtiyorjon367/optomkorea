import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Converts JWT_EXPIRES_IN string into seconds for jsonwebtoken.
 *
 * Args:
 *   value (string): Duration string such as "7d", "12h", or "3600".
 *
 * Returns:
 *   number: Duration value in seconds.
 */
function parseJwtExpiresIn(value: string): number {
  if (value.endsWith('d')) {
    return Number(value.replace('d', '')) * 24 * 60 * 60;
  }
  if (value.endsWith('h')) {
    return Number(value.replace('h', '')) * 60 * 60;
  }
  if (value.endsWith('m')) {
    return Number(value.replace('m', '')) * 60;
  }
  if (value.endsWith('s')) {
    return Number(value.replace('s', ''));
  }
  return Number(value);
}

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configuredExpiresIn =
          configService.get<string>('JWT_EXPIRES_IN') ?? '7d';
        const expiresIn = parseJwtExpiresIn(configuredExpiresIn);
        return {
          secret:
            configService.get<string>('JWT_SECRET') ?? 'dev_secret_change_me',
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
