import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly configService;
    private readonly jwtService;
    private readonly usersService;
    constructor(configService: ConfigService, jwtService: JwtService, usersService: UsersService);
    loginWithPassword(username: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            role: "admin" | "manager" | "user";
            firstName: string;
            lastName: string | null | undefined;
            username: string | null | undefined;
        };
    }>;
    loginWithTelegram(payload: Record<string, unknown>): Promise<{
        token: string;
        user: {
            id: string;
            role: "admin" | "manager" | "user";
            firstName: string;
            lastName: string | null | undefined;
            username: string | null | undefined;
        };
    }>;
    private verifyTelegramSignature;
    private getRequiredString;
    private getOptionalString;
}
