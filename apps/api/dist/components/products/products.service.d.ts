import { Model } from 'mongoose';
import { CreateProductDto, UpdateProductDto } from '../../libs/dto/product.dto';
import type { ManagerProductDocument, ProductDocument, ReceiptDocument, SaleItemDocument, ShipmentDocument, StockTransferDocument } from '../../schemas/documents';
export declare const PRODUCT_DELETE_BLOCKED = "PRODUCT_HAS_DEPENDENCIES";
export declare class ProductsService {
    private readonly productModel;
    private readonly shipmentModel;
    private readonly managerProductModel;
    private readonly saleItemModel;
    private readonly receiptModel;
    private readonly stockTransferModel;
    constructor(productModel: Model<ProductDocument>, shipmentModel: Model<ShipmentDocument>, managerProductModel: Model<ManagerProductDocument>, saleItemModel: Model<SaleItemDocument>, receiptModel: Model<ReceiptDocument>, stockTransferModel: Model<StockTransferDocument>);
    create(dto: CreateProductDto, userId: string): Promise<ProductDocument>;
    findAll(query: {
        category?: string;
        brand?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
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
        } & import("mongoose").DefaultTimestampProps, {}, import("mongoose").DefaultSchemaOptions> & {
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
        } & {
            id: string;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
    search(q: string): Promise<(import("mongoose").Document<unknown, {}, {
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
    } & import("mongoose").DefaultTimestampProps, {}, import("mongoose").DefaultSchemaOptions> & {
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
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    findById(id: string): Promise<ProductDocument>;
    aggregateInventory(productId: string): Promise<{
        totalShipped: number;
        shippedCount: number;
        totalReceived: number;
        totalSold: number;
        totalAvail: number;
        inTransit: number;
    }>;
    aggregateInventoryByManager(productId: string): Promise<{
        manager: import("mongoose").Types.ObjectId;
        received: number;
        avail: number;
        sold: number;
    }[]>;
    update(id: string, dto: UpdateProductDto): Promise<ProductDocument>;
    appendUploadedImages(productId: string, files: Express.Multer.File[]): Promise<{
        urls: string[];
    }>;
    remove(id: string): Promise<void>;
}
