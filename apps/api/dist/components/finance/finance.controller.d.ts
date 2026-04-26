import { FinanceService } from './finance.service';
import { CreateTransactionDto } from '../../libs/dto/finance.dto';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    create(dto: CreateTransactionDto, user: {
        id: string;
    }): Promise<{
        data: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, {
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
        }>;
    }>;
    findAll(managerId?: string): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
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
        }>)[];
    }>;
    getBalance(managerId: string): Promise<{
        data: {
            managerId: string;
            totalGiven: number;
            totalReceived: number;
            net: number;
        };
    }>;
    getAllBalances(): Promise<{
        data: {
            net: number;
            managerId: string;
            manager: unknown;
            totalGiven: number;
            totalReceived: number;
        }[];
    }>;
}
