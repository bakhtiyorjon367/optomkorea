import { Connection, Model } from 'mongoose';
import type { ManagerProductDocument, ProductDocument, ReceiptDocument, ShipmentDocument } from '../../schemas/documents';
import { CreateShipmentDto } from '../../libs/dto/shipment.dto';
import { ManagerProductsService } from '../manager-products/manager-products.service';
export declare const partialDistributionShipmentFilter: {
    readonly $expr: {
        readonly $and: readonly [{
            readonly $gt: readonly ["$quantityDistributed", 0];
        }, {
            readonly $lt: readonly ["$quantityDistributed", "$quantityTotal"];
        }];
    };
};
export declare class ShipmentsService {
    private readonly shipmentModel;
    private readonly receiptModel;
    private readonly productModel;
    private readonly connection;
    private readonly managerProductsService;
    constructor(shipmentModel: Model<ShipmentDocument>, receiptModel: Model<ReceiptDocument>, productModel: Model<ProductDocument>, connection: Connection, managerProductsService: ManagerProductsService);
    receive(shipmentId: string, managerId: string, quantity: number): Promise<ManagerProductDocument>;
    create(dto: CreateShipmentDto, createdByUserId?: string): Promise<ShipmentDocument>;
    findAll(productId?: string, distribution?: string): Promise<{
        productId: string;
        product: {
            name: string;
            images: string[];
            totalShipped: number;
            shippedCount: number;
        } | undefined;
        quantityRemaining: number;
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
        quantityTotal: number;
        quantityDistributed: number;
        costKrwTotal: number;
        shippedAt: NativeDate;
        notes: string;
        createdBy?: import("mongoose").Types.ObjectId | null | undefined;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        __v: number;
        id: string;
    }[]>;
    findAvailable(): Promise<{
        quantityRemaining: number;
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
        productId: import("mongoose").Types.ObjectId;
        quantityTotal: number;
        quantityDistributed: number;
        costKrwTotal: number;
        shippedAt: NativeDate;
        notes: string;
        createdBy?: import("mongoose").Types.ObjectId | null | undefined;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        __v: number;
        id: string;
    }[]>;
    findReceiptsByShipment(shipmentId: string): Promise<(import("mongoose").Document<unknown, {}, {
        managerId: import("mongoose").Types.ObjectId;
        productId: import("mongoose").Types.ObjectId;
        shipmentId: import("mongoose").Types.ObjectId;
        quantity: number;
        receivedAt: NativeDate;
        createdAt: NativeDate;
    }, {}, import("mongoose").DefaultSchemaOptions> & {
        managerId: import("mongoose").Types.ObjectId;
        productId: import("mongoose").Types.ObjectId;
        shipmentId: import("mongoose").Types.ObjectId;
        quantity: number;
        receivedAt: NativeDate;
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
}
