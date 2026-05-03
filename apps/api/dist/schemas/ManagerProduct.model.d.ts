import { Schema } from 'mongoose';
declare const ManagerProductSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: true;
}, {
    managerId: import("mongoose").Types.ObjectId;
    productId: import("mongoose").Types.ObjectId;
    quantityReceived: number;
    quantityAvail: number;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    managerId: import("mongoose").Types.ObjectId;
    productId: import("mongoose").Types.ObjectId;
    quantityReceived: number;
    quantityAvail: number;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, Omit<import("mongoose").DefaultSchemaOptions, "timestamps" | "collection"> & {
    collection: string;
    timestamps: true;
}> & Omit<{
    managerId: import("mongoose").Types.ObjectId;
    productId: import("mongoose").Types.ObjectId;
    quantityReceived: number;
    quantityAvail: number;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    managerId: import("mongoose").Types.ObjectId;
    productId: import("mongoose").Types.ObjectId;
    quantityReceived: number;
    quantityAvail: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export default ManagerProductSchema;
