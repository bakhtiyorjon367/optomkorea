import { Schema } from 'mongoose';
declare const CategorySchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: {
        createdAt: true;
        updatedAt: false;
    };
    collection: string;
}, {
    name: string;
    createdAt: NativeDate;
}, import("mongoose").Document<unknown, {}, {
    name: string;
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
    name: string;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    name: string;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export default CategorySchema;
