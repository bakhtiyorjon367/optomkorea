import { Schema } from 'mongoose';
declare const StockTransferSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: {
        createdAt: true;
        updatedAt: false;
    };
}, {
    productId: import("mongoose").Types.ObjectId;
    quantity: number;
    status: "pending" | "confirmed";
    fromManagerId: import("mongoose").Types.ObjectId;
    toManagerId: import("mongoose").Types.ObjectId;
    initiatedAt: NativeDate;
    confirmedAt?: NativeDate | null | undefined;
    createdAt: NativeDate;
}, import("mongoose").Document<unknown, {}, {
    productId: import("mongoose").Types.ObjectId;
    quantity: number;
    status: "pending" | "confirmed";
    fromManagerId: import("mongoose").Types.ObjectId;
    toManagerId: import("mongoose").Types.ObjectId;
    initiatedAt: NativeDate;
    confirmedAt?: NativeDate | null | undefined;
    createdAt: NativeDate;
}, {
    id: string;
}, Omit<import("mongoose").DefaultSchemaOptions, "timestamps" | "collection"> & {
    collection: string;
    timestamps: {
        createdAt: true;
        updatedAt: false;
    };
}> & Omit<{
    productId: import("mongoose").Types.ObjectId;
    quantity: number;
    status: "pending" | "confirmed";
    fromManagerId: import("mongoose").Types.ObjectId;
    toManagerId: import("mongoose").Types.ObjectId;
    initiatedAt: NativeDate;
    confirmedAt?: NativeDate | null | undefined;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    productId: import("mongoose").Types.ObjectId;
    quantity: number;
    status: "pending" | "confirmed";
    fromManagerId: import("mongoose").Types.ObjectId;
    toManagerId: import("mongoose").Types.ObjectId;
    initiatedAt: NativeDate;
    confirmedAt?: NativeDate | null | undefined;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export default StockTransferSchema;
