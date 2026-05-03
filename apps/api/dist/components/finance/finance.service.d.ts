import { Model } from 'mongoose';
import type { FinanceTransactionDocument } from '../../schemas/documents';
import { CreateTransactionDto } from '../../libs/dto/finance.dto';
export declare class FinanceService {
    private readonly txModel;
    constructor(txModel: Model<FinanceTransactionDocument>);
    create(dto: CreateTransactionDto, recordedBy: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, {
        type: "admin_gave" | "manager_paid";
        managerId: import("mongoose").Types.ObjectId;
        amount: number;
        note: string;
        transactionDate: NativeDate;
        recordedBy: import("mongoose").Types.ObjectId;
        createdAt: NativeDate;
    }, {}, import("mongoose").DefaultSchemaOptions> & {
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
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, {
        type: "admin_gave" | "manager_paid";
        managerId: import("mongoose").Types.ObjectId;
        amount: number;
        note: string;
        transactionDate: NativeDate;
        recordedBy: import("mongoose").Types.ObjectId;
        createdAt: NativeDate;
    }, {}, import("mongoose").DefaultSchemaOptions> & {
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
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findAll(managerId?: string): Promise<(import("mongoose").Document<unknown, {}, {
        type: "admin_gave" | "manager_paid";
        managerId: import("mongoose").Types.ObjectId;
        amount: number;
        note: string;
        transactionDate: NativeDate;
        recordedBy: import("mongoose").Types.ObjectId;
        createdAt: NativeDate;
    }, {}, import("mongoose").DefaultSchemaOptions> & {
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
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getBalance(managerId: string): Promise<{
        managerId: string;
        totalGiven: number;
        totalReceived: number;
        net: number;
    }>;
    getAllBalances(): Promise<{
        net: number;
        managerId: string;
        manager: unknown;
        totalGiven: number;
        totalReceived: number;
    }[]>;
}
