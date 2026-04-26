import { Schema } from 'mongoose';
declare const ShipmentSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: true;
}, {
    productId: import("mongoose").Types.ObjectId;
    quantityTotal: number;
    quantityDistributed: number;
    costKrwTotal: number;
    shippedAt: NativeDate;
    notes: string;
    createdBy?: import("mongoose").Types.ObjectId | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    productId: import("mongoose").Types.ObjectId;
    quantityTotal: number;
    quantityDistributed: number;
    costKrwTotal: number;
    shippedAt: NativeDate;
    notes: string;
    createdBy?: import("mongoose").Types.ObjectId | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, Omit<import("mongoose").DefaultSchemaOptions, "timestamps" | "collection"> & {
    collection: string;
    timestamps: true;
}> & Omit<{
    productId: import("mongoose").Types.ObjectId;
    quantityTotal: number;
    quantityDistributed: number;
    costKrwTotal: number;
    shippedAt: NativeDate;
    notes: string;
    createdBy?: import("mongoose").Types.ObjectId | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    productId: import("mongoose").Types.ObjectId;
    quantityTotal: number;
    quantityDistributed: number;
    costKrwTotal: number;
    shippedAt: NativeDate;
    notes: string;
    createdBy?: import("mongoose").Types.ObjectId | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export default ShipmentSchema;
