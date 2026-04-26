import { Connection, Model, Types } from 'mongoose';
import type { ProductDocument, StockTransferDocument } from '../../schemas/documents';
import { CreateTransferDto } from '../../libs/dto/transfer.dto';
import { ManagerProductsService } from '../manager-products/manager-products.service';
export declare class TransfersService {
    private readonly transferModel;
    private readonly productModel;
    private readonly connection;
    private readonly managerProductsService;
    constructor(transferModel: Model<StockTransferDocument>, productModel: Model<ProductDocument>, connection: Connection, managerProductsService: ManagerProductsService);
    create(dto: CreateTransferDto, senderId: string): Promise<StockTransferDocument>;
    confirm(transferId: string, receiverId: string): Promise<StockTransferDocument>;
    findIncoming(managerId: string): Promise<(import("mongoose").Document<unknown, {}, {
        productId: Types.ObjectId;
        quantity: number;
        status: "pending" | "confirmed";
        fromManagerId: Types.ObjectId;
        toManagerId: Types.ObjectId;
        initiatedAt: NativeDate;
        confirmedAt?: NativeDate | null | undefined;
        createdAt: NativeDate;
    }, {}, import("mongoose").DefaultSchemaOptions> & {
        productId: Types.ObjectId;
        quantity: number;
        status: "pending" | "confirmed";
        fromManagerId: Types.ObjectId;
        toManagerId: Types.ObjectId;
        initiatedAt: NativeDate;
        confirmedAt?: NativeDate | null | undefined;
        createdAt: NativeDate;
    } & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, {
        productId: Types.ObjectId;
        quantity: number;
        status: "pending" | "confirmed";
        fromManagerId: Types.ObjectId;
        toManagerId: Types.ObjectId;
        initiatedAt: NativeDate;
        confirmedAt?: NativeDate | null | undefined;
        createdAt: NativeDate;
    }, {}, import("mongoose").DefaultSchemaOptions> & {
        productId: Types.ObjectId;
        quantity: number;
        status: "pending" | "confirmed";
        fromManagerId: Types.ObjectId;
        toManagerId: Types.ObjectId;
        initiatedAt: NativeDate;
        confirmedAt?: NativeDate | null | undefined;
        createdAt: NativeDate;
    } & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
}
