import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from '../../libs/dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        data: (import("mongoose").Document<unknown, {}, {
            name: string;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            name: string;
            createdAt: NativeDate;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    create(dto: CreateCategoryDto): Promise<{
        data: import("mongoose").Document<unknown, {}, {
            name: string;
            createdAt: NativeDate;
        }, {}, import("mongoose").DefaultSchemaOptions> & {
            name: string;
            createdAt: NativeDate;
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    remove(id: string): Promise<{
        data: {
            deleted: boolean;
        };
    }>;
}
