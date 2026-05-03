import { AuthService } from './auth.service';
import { LoginDto } from '../../libs/dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    telegramLogin(payload: Record<string, unknown>): Promise<{
        data: {
            token: string;
            user: {
                id: string;
                role: "admin" | "manager" | "user";
                firstName: string;
                lastName: string | null | undefined;
                username: string | null | undefined;
            };
        };
    }>;
    login(dto: LoginDto): Promise<{
        data: {
            token: string;
            user: {
                id: string;
                role: "admin" | "manager" | "user";
                firstName: string;
                lastName: string | null | undefined;
                username: string | null | undefined;
            };
        };
    }>;
}
