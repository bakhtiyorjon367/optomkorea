import { Schema } from 'mongoose';
declare const ProductSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: true;
}, {
    name: string;
    description: string;
    brand: string;
    category: string;
    costKrw: number;
    sellingPrice: number;
    totalAvail: number;
    totalShipped: number;
    totalReceived: number;
    shippedCount: number;
    soldCount: number;
    images: string[];
    createdBy?: import("mongoose").Types.ObjectId | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    name: string;
    description: string;
    brand: string;
    category: string;
    costKrw: number;
    sellingPrice: number;
    totalAvail: number;
    totalShipped: number;
    totalReceived: number;
    shippedCount: number;
    soldCount: number;
    images: string[];
    createdBy?: import("mongoose").Types.ObjectId | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, Omit<import("mongoose").DefaultSchemaOptions, "timestamps" | "collection"> & {
    collection: string;
    timestamps: true;
}> & Omit<{
    name: string;
    description: string;
    brand: string;
    category: string;
    costKrw: number;
    sellingPrice: number;
    totalAvail: number;
    totalShipped: number;
    totalReceived: number;
    shippedCount: number;
    soldCount: number;
    images: string[];
    createdBy?: import("mongoose").Types.ObjectId | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    name: string;
    description: string;
    brand: string;
    category: string;
    costKrw: number;
    sellingPrice: number;
    totalAvail: number;
    totalShipped: number;
    totalReceived: number;
    shippedCount: number;
    soldCount: number;
    images: string[];
    createdBy?: import("mongoose").Types.ObjectId | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export default ProductSchema;
