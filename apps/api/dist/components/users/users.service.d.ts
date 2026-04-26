import { Model } from 'mongoose';
import { UpsertTelegramUserDto } from '../../libs/dto/user.dto';
import type { UserDocument } from '../../schemas/documents';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    upsertFromTelegram(dto: UpsertTelegramUserDto): Promise<UserDocument>;
    findByUsername(username: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    findAll(): Promise<UserDocument[]>;
    findByRole(role: string): Promise<UserDocument[]>;
    findManagers(excludeUserId?: string): Promise<UserDocument[]>;
    updateRole(userId: string, role: 'admin' | 'manager' | 'user'): Promise<UserDocument>;
    updateProfile(userId: string, updates: {
        firstName?: string;
        lastName?: string;
    }): Promise<UserDocument>;
    createWithPassword(username: string, password: string, firstName: string, lastName?: string, role?: 'admin' | 'manager' | 'user'): Promise<UserDocument>;
    validatePassword(username: string, password: string): Promise<UserDocument | null>;
}
