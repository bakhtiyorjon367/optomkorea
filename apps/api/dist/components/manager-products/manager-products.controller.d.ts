import { ManagerProductsService } from './manager-products.service';
import { ShipmentsService } from '../shipments/shipments.service';
import { ReceiveProductDto } from '../../libs/dto/manager-product.dto';
export declare class ManagerProductsController {
    private readonly mpService;
    private readonly shipmentsService;
    constructor(mpService: ManagerProductsService, shipmentsService: ShipmentsService);
    receive(dto: ReceiveProductDto, user: {
        id: string;
    }): Promise<{
        data: import("mongoose").Document<unknown, {}, {
            managerId: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            quantityReceived: number;
            quantityAvail: number;
        } & import("mongoose").DefaultTimestampProps, {}, import("mongoose").DefaultSchemaOptions> & {
            managerId: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            quantityReceived: number;
            quantityAvail: number;
        } & import("mongoose").DefaultTimestampProps & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    findMine(user: {
        id: string;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
            managerId: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            quantityReceived: number;
            quantityAvail: number;
        } & import("mongoose").DefaultTimestampProps, {}, import("mongoose").DefaultSchemaOptions> & {
            managerId: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            quantityReceived: number;
            quantityAvail: number;
        } & import("mongoose").DefaultTimestampProps & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
    }>;
    findAll(managerId?: string): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
            managerId: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            quantityReceived: number;
            quantityAvail: number;
        } & import("mongoose").DefaultTimestampProps, {}, import("mongoose").DefaultSchemaOptions> & {
            managerId: import("mongoose").Types.ObjectId;
            productId: import("mongoose").Types.ObjectId;
            quantityReceived: number;
            quantityAvail: number;
        } & import("mongoose").DefaultTimestampProps & {
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
