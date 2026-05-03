import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from '../../libs/dto/shipment.dto';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    create(dto: CreateShipmentDto, user: {
        id: string;
    }): Promise<{
        data: import("mongoose").Document<unknown, {}, {
            productId: import("mongoose").Types.ObjectId;
            quantityTotal: number;
            quantityDistributed: number;
            costKrwTotal: number;
            shippedAt: NativeDate;
            notes: string;
            createdBy?: import("mongoose").Types.ObjectId | null | undefined;
        } & import("mongoose").DefaultTimestampProps, {}, import("mongoose").DefaultSchemaOptions> & {
            productId: import("mongoose").Types.ObjectId;
            quantityTotal: number;
            quantityDistributed: number;
            costKrwTotal: number;
            shippedAt: NativeDate;
            notes: string;
            createdBy?: import("mongoose").Types.ObjectId | null | undefined;
        } & import("mongoose").DefaultTimestampProps & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    findAll(productId?: string, distribution?: string): Promise<{
        data: {
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
            db: import("mongoose").Connection;
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
        }[];
    }>;
    findAvailable(): Promise<{
        data: {
            quantityRemaining: number;
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
        }[];
    }>;
    findReceipts(id: string): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
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
        }>)[];
    }>;
}
