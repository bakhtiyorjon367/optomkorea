import { type ClientSession, Model, Types } from 'mongoose';
import type { ManagerProductDocument } from '../../schemas/documents';
export declare class ManagerProductsService {
    private readonly mpModel;
    constructor(mpModel: Model<ManagerProductDocument>);
    upsertStock(managerId: string, productId: string, qty: number, session?: ClientSession): Promise<void>;
    findPopulatedByManagerAndProduct(managerId: string, productId: string): Promise<ManagerProductDocument>;
    updateLocalStock(managerId: string, productId: string, qty: number, session?: ClientSession): Promise<void>;
    findAll(query?: {
        managerId?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, {
        managerId: Types.ObjectId;
        productId: Types.ObjectId;
        quantityReceived: number;
        quantityAvail: number;
    } & import("mongoose").DefaultTimestampProps, {}, import("mongoose").DefaultSchemaOptions> & {
        managerId: Types.ObjectId;
        productId: Types.ObjectId;
        quantityReceived: number;
        quantityAvail: number;
    } & import("mongoose").DefaultTimestampProps & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    findByManager(managerId: string): Promise<(import("mongoose").Document<unknown, {}, {
        managerId: Types.ObjectId;
        productId: Types.ObjectId;
        quantityReceived: number;
        quantityAvail: number;
    } & import("mongoose").DefaultTimestampProps, {}, import("mongoose").DefaultSchemaOptions> & {
        managerId: Types.ObjectId;
        productId: Types.ObjectId;
        quantityReceived: number;
        quantityAvail: number;
    } & import("mongoose").DefaultTimestampProps & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
}
