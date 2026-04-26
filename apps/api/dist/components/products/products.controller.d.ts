import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from '../../libs/dto/product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(category?: string, brand?: string, search?: string, page?: string, limit?: string): Promise<{
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
    search(q: string): Promise<{
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
    }>;
    getInventoryByManager(id: string): Promise<{
        data: {
            manager: import("mongoose").Types.ObjectId;
            received: number;
            avail: number;
            sold: number;
        }[];
    }>;
    getInventory(id: string): Promise<{
        data: {
            totalShipped: number;
            shippedCount: number;
            totalReceived: number;
            totalSold: number;
            totalAvail: number;
            inTransit: number;
        };
    }>;
    findById(id: string): Promise<{
        data: import("mongoose").Document<unknown, {}, {
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
        };
    }>;
    create(dto: CreateProductDto, user: {
        id: string;
    }): Promise<{
        data: import("mongoose").Document<unknown, {}, {
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
        };
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        data: import("mongoose").Document<unknown, {}, {
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
        };
    }>;
    uploadImages(id: string, files: Express.Multer.File[]): Promise<{
        data: {
            urls: string[];
        };
    }>;
    remove(id: string): Promise<{
        data: {
            deleted: boolean;
        };
    }>;
}
