import { Model } from 'mongoose';
import type { CategoryDocument } from '../../schemas/documents';
export declare class CategoriesService {
    private readonly categoryModel;
    constructor(categoryModel: Model<CategoryDocument>);
    create(name: string): Promise<CategoryDocument>;
    findAll(): Promise<CategoryDocument[]>;
    remove(id: string): Promise<void>;
}
