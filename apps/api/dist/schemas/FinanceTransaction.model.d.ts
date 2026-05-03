import { Schema } from 'mongoose';
declare const FinanceTransactionSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: {
        createdAt: true;
        updatedAt: false;
    };
}, {
    type: "admin_gave" | "manager_paid";
    managerId: import("mongoose").Types.ObjectId;
    amount: number;
    note: string;
    transactionDate: NativeDate;
    recordedBy: import("mongoose").Types.ObjectId;
    createdAt: NativeDate;
}, import("mongoose").Document<unknown, {}, {
    type: "admin_gave" | "manager_paid";
    managerId: import("mongoose").Types.ObjectId;
    amount: number;
    note: string;
    transactionDate: NativeDate;
    recordedBy: import("mongoose").Types.ObjectId;
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
    type: "admin_gave" | "manager_paid";
    managerId: import("mongoose").Types.ObjectId;
    amount: number;
    note: string;
    transactionDate: NativeDate;
    recordedBy: import("mongoose").Types.ObjectId;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    type: "admin_gave" | "manager_paid";
    managerId: import("mongoose").Types.ObjectId;
    amount: number;
    note: string;
    transactionDate: NativeDate;
    recordedBy: import("mongoose").Types.ObjectId;
    createdAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export default FinanceTransactionSchema;
