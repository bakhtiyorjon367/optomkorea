import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  role: 'admin' | 'manager' | 'user';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'dev_secret_change_me',
    });
  }

  /**
   * Maps JWT payload into request user object.
   *
   * Args:
   *   payload (JwtPayload): Decoded token payload.
   *
   * Returns:
   *   { id: string; role: 'admin' | 'manager' | 'user' }: Request user object.
   */
  validate(payload: JwtPayload): {
    id: string;
    role: 'admin' | 'manager' | 'user';
  } {
    return { id: payload.sub, role: payload.role };
  }
}
