import { SalesService } from './sales.service';
import { CreateSaleDto } from '../../libs/dto/sale.dto';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(dto: CreateSaleDto, user: {
        id: string;
    }): Promise<{
        data: {
            sale: import("mongoose").Document<unknown, {}, {
                type: "cash" | "credit";
                comment: string;
                managerId: import("mongoose").Types.ObjectId;
                buyerName: string;
                status: "paid" | "unpaid";
                totalAmount: number;
                amountPaid: number;
                itemCount: number;
                createdAt: NativeDate;
            }, {}, import("mongoose").DefaultSchemaOptions> & {
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
            } & {
                id: string;
            };
            items: (import("mongoose").Document<unknown, {}, {
                productId: import("mongoose").Types.ObjectId;
                quantity: number;
                saleId: import("mongoose").Types.ObjectId;
                price: number;
                createdAt: NativeDate;
            }, {}, import("mongoose").DefaultSchemaOptions> & {
                productId: import("mongoose").Types.ObjectId;
                quantity: number;
                saleId: import("mongoose").Types.ObjectId;
                price: number;
                createdAt: NativeDate;
            } & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            } & {
                id: string;
            })[];
        };
    }>;
    findMine(user: {
        id: string;
    }): Promise<{
        data: {
            items: (import("mongoose").Document<unknown, {}, {
                productId: import("mongoose").Types.ObjectId;
                quantity: number;
                saleId: import("mongoose").Types.ObjectId;
                price: number;
                createdAt: NativeDate;
            }, {}, import("mongoose").DefaultSchemaOptions> & {
                productId: import("mongoose").Types.ObjectId;
                quantity: number;
                saleId: import("mongoose").Types.ObjectId;
                price: number;
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
            _id: import("mongoose").Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            type: "cash" | "credit";
            comment: string;
            managerId: import("mongoose").Types.ObjectId;
            buyerName: string;
            status: "paid" | "unpaid";
            totalAmount: number;
            amountPaid: number;
            itemCount: number;
            createdAt: NativeDate;
            __v: number;
            id: string;
        }[];
    }>;
    findAll(paymentType?: 'cash' | 'credit'): Promise<{
        data: {
            items: (import("mongoose").Document<unknown, {}, {
                productId: import("mongoose").Types.ObjectId;
                quantity: number;
                saleId: import("mongoose").Types.ObjectId;
                price: number;
                createdAt: NativeDate;
            }, {}, import("mongoose").DefaultSchemaOptions> & {
                productId: import("mongoose").Types.ObjectId;
                quantity: number;
                saleId: import("mongoose").Types.ObjectId;
                price: number;
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
            _id: import("mongoose").Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            type: "cash" | "credit";
            comment: string;
            managerId: import("mongoose").Types.ObjectId;
            buyerName: string;
            status: "paid" | "unpaid";
            totalAmount: number;
            amountPaid: number;
            itemCount: number;
            createdAt: NativeDate;
            __v: number;
            id: string;
        }[];
    }>;
    updateStatus(id: string, status: 'paid' | 'unpaid', amountPaid?: number): Promise<{
        data: import("mongoose").Document<unknown, {}, {
            type: "cash" | "credit";
            comment: string;
            managerId: import("mongoose").Types.ObjectId;
            buyerName: string;
            status: "paid" | "unpaid";
            totalAmount: number;
            amountPaid: number;
            itemCount: number;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
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
        } & {
            id: string;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
    }>;
    addPayment(id: string, amount: number, user: {
        id: string;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
            type: "cash" | "credit";
            comment: string;
            managerId: import("mongoose").Types.ObjectId;
            buyerName: string;
            status: "paid" | "unpaid";
            totalAmount: number;
            amountPaid: number;
            itemCount: number;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
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
        } & {
            id: string;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>) | null;
    }>;
}
