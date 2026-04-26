import { TransfersService } from './transfers.service';
import { CreateTransferDto } from '../../libs/dto/transfer.dto';
export declare class TransfersController {
    private readonly transfersService;
    constructor(transfersService: TransfersService);
    create(dto: CreateTransferDto, user: {
        id: string;
    }): Promise<{
        data: import("mongoose").Document<unknown, {}, {
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            status: "pending" | "confirmed";
            fromManagerId: import("mongoose").Types.ObjectId;
            toManagerId: import("mongoose").Types.ObjectId;
            initiatedAt: NativeDate;
            confirmedAt?: NativeDate | null | undefined;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            status: "pending" | "confirmed";
            fromManagerId: import("mongoose").Types.ObjectId;
            toManagerId: import("mongoose").Types.ObjectId;
            initiatedAt: NativeDate;
            confirmedAt?: NativeDate | null | undefined;
            createdAt: NativeDate;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    findIncoming(user: {
        id: string;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            status: "pending" | "confirmed";
            fromManagerId: import("mongoose").Types.ObjectId;
            toManagerId: import("mongoose").Types.ObjectId;
            initiatedAt: NativeDate;
            confirmedAt?: NativeDate | null | undefined;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            status: "pending" | "confirmed";
            fromManagerId: import("mongoose").Types.ObjectId;
            toManagerId: import("mongoose").Types.ObjectId;
            initiatedAt: NativeDate;
            confirmedAt?: NativeDate | null | undefined;
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
    confirm(id: string, user: {
        id: string;
    }): Promise<{
        data: import("mongoose").Document<unknown, {}, {
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            status: "pending" | "confirmed";
            fromManagerId: import("mongoose").Types.ObjectId;
            toManagerId: import("mongoose").Types.ObjectId;
            initiatedAt: NativeDate;
            confirmedAt?: NativeDate | null | undefined;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            status: "pending" | "confirmed";
            fromManagerId: import("mongoose").Types.ObjectId;
            toManagerId: import("mongoose").Types.ObjectId;
            initiatedAt: NativeDate;
            confirmedAt?: NativeDate | null | undefined;
            createdAt: NativeDate;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    findAll(): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            status: "pending" | "confirmed";
            fromManagerId: import("mongoose").Types.ObjectId;
            toManagerId: import("mongoose").Types.ObjectId;
            initiatedAt: NativeDate;
            confirmedAt?: NativeDate | null | undefined;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            productId: import("mongoose").Types.ObjectId;
            quantity: number;
            status: "pending" | "confirmed";
            fromManagerId: import("mongoose").Types.ObjectId;
            toManagerId: import("mongoose").Types.ObjectId;
            initiatedAt: NativeDate;
            confirmedAt?: NativeDate | null | undefined;
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
