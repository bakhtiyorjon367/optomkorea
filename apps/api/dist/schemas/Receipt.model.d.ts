import { Schema } from 'mongoose';
declare const ReceiptSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: {
        createdAt: true;
        updatedAt: false;
    };
}, {
    managerId: import("mongoose").Types.ObjectId;
    productId: import("mongoose").Types.ObjectId;
    shipmentId: import("mongoose").Types.ObjectId;
    quantity: number;
    receivedAt: NativeDate;
    createdAt: NativeDate;
}, import("mongoose").Document<unknown, {}, {
    managerId: import("mongoose").Types.ObjectId;
    productId: import("mongoose").Types.ObjectId;
    shipmentId: import("mongoose").Types.ObjectId;
    quantity: number;
    receivedAt: NativeDate;
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
    managerId: import("mongoose").Types.ObjectId;
    productId: import("mongoose").Types.ObjectId;
    shipmentId: import("mongoose").Types.ObjectId;
    quantity: number;
    receivedAt: NativeDate;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    managerId: import("mongoose").Types.ObjectId;
    productId: import("mongoose").Types.ObjectId;
    shipmentId: import("mongoose").Types.ObjectId;
    quantity: number;
    receivedAt: NativeDate;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export default ReceiptSchema;
