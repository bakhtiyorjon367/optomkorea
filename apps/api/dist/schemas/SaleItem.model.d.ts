import { Schema } from 'mongoose';
declare const SaleItemSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: {
        createdAt: true;
        updatedAt: false;
    };
}, {
    productId: import("mongoose").Types.ObjectId;
    quantity: number;
    saleId: import("mongoose").Types.ObjectId;
    price: number;
    createdAt: NativeDate;
}, import("mongoose").Document<unknown, {}, {
    productId: import("mongoose").Types.ObjectId;
    quantity: number;
    saleId: import("mongoose").Types.ObjectId;
    price: number;
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
    saleId: import("mongoose").Types.ObjectId;
    price: number;
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
    saleId: import("mongoose").Types.ObjectId;
    price: number;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export default SaleItemSchema;
