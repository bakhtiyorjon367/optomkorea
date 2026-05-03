import { Schema } from 'mongoose';
declare const SaleSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: {
        createdAt: true;
        updatedAt: false;
    };
}, {
    type: "cash" | "credit";
    comment: string;
    managerId: import("mongoose").Types.ObjectId;
    buyerName: string;
    status: "paid" | "unpaid";
    totalAmount: number;
    amountPaid: number;
    itemCount: number;
    createdAt: NativeDate;
}, import("mongoose").Document<unknown, {}, {
    type: "cash" | "credit";
    comment: string;
    managerId: import("mongoose").Types.ObjectId;
    buyerName: string;
    status: "paid" | "unpaid";
    totalAmount: number;
    amountPaid: number;
    itemCount: number;
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
    type: "cash" | "credit";
    comment: string;
    managerId: import("mongoose").Types.ObjectId;
    buyerName: string;
    status: "paid" | "unpaid";
    totalAmount: number;
    amountPaid: number;
    itemCount: number;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    type: "cash" | "credit";
    comment: string;
    managerId: import("mongoose").Types.ObjectId;
    buyerName: string;
    status: "paid" | "unpaid";
    totalAmount: number;
    amountPaid: number;
    itemCount: number;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export default SaleSchema;
