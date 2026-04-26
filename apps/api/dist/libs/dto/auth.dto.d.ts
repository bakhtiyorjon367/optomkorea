export declare class LoginDto {
    username: string;
    password: string;
}
export declare class TelegramLoginDto {
    id: string;
    auth_date: string;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    language_code?: string;
    allows_write_to_pm?: string;
    is_premium?: string;
    hash: string;
}
