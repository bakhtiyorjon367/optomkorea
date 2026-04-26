export declare class CreateProductDto {
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    costKrw?: number;
    sellingPrice: number;
    images?: string[];
}
export declare class UpdateProductDto {
    name?: string;
    brand?: string;
    category?: string;
    description?: string;
    costKrw?: number;
    sellingPrice?: number;
    images?: string[];
}
