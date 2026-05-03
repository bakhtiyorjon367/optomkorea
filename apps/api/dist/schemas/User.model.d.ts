import { Schema } from 'mongoose';
declare const UserSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: {
        createdAt: true;
        updatedAt: false;
    };
    collection: string;
}, {
    firstName: string;
    role: "admin" | "manager" | "user";
    telegramId?: number | null | undefined;
    username?: string | null | undefined;
    password?: string | null | undefined;
    lastName?: string | null | undefined;
    createdAt: NativeDate;
}, import("mongoose").Document<unknown, {}, {
    firstName: string;
    role: "admin" | "manager" | "user";
    telegramId?: number | null | undefined;
    username?: string | null | undefined;
    password?: string | null | undefined;
    lastName?: string | null | undefined;
    createdAt: NativeDate;
}, {
    id: string;
}, Omit<import("mongoose").DefaultSchemaOptions, "timestamps" | "collection"> & {
    timestamps: {
        createdAt: true;
        updatedAt: false;
    };
    collection: string;
}> & Omit<{
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
}, "id"> & {
    id: string;
}, unknown, {
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
}>;
export default UserSchema;
