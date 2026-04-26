import { Connection, Model } from 'mongoose';
import type { ProductDocument, SaleDocument, SaleItemDocument } from '../../schemas/documents';
import { CreateSaleDto } from '../../libs/dto/sale.dto';
import { ManagerProductsService } from '../manager-products/manager-products.service';
export declare class SalesService {
    private readonly saleModel;
    private readonly saleItemModel;
    private readonly productModel;
    private readonly connection;
    private readonly managerProductsService;
    constructor(saleModel: Model<SaleDocument>, saleItemModel: Model<SaleItemDocument>, productModel: Model<ProductDocument>, connection: Connection, managerProductsService: ManagerProductsService);
    create(dto: CreateSaleDto, managerId: string): Promise<{
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
    }>;
    findByManager(managerId: string): Promise<{
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
        db: Connection;
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
    }[]>;
    findAll(paymentType?: 'cash' | 'credit'): Promise<{
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
        db: Connection;
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
    }[]>;
    findByManagerGrouped(managerId: string): Promise<{
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
        db: Connection;
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
    }[]>;
    updateStatus(saleId: string, status: 'paid' | 'unpaid', amountPaid?: number): Promise<import("mongoose").Document<unknown, {}, {
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
    }>>;
    addPayment(saleId: string, amount: number, managerId: string): Promise<(import("mongoose").Document<unknown, {}, {
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
    }>) | null>;
}
