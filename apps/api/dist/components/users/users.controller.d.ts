import { UsersService } from './users.service';
import { UpdateProfileDto } from '../../libs/dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(reqUser: {
        id: string;
        role: string;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }) | null;
    }>;
    updateProfile(reqUser: {
        id: string;
        role: string;
    }, dto: UpdateProfileDto): Promise<{
        data: import("mongoose").Document<unknown, {}, {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    findAll(): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    findManagers(reqUser: {
        id: string;
    }, excludeSelf?: string): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    updateRole(id: string, role: 'admin' | 'manager' | 'user'): Promise<{
        data: import("mongoose").Document<unknown, {}, {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            firstName: string;
            role: "admin" | "manager" | "user";
            telegramId?: number | null | undefined;
            username?: string | null | undefined;
            password?: string | null | undefined;
            lastName?: string | null | undefined;
            createdAt: NativeDate;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
}
