export declare class CreateSaleItemDto {
    productId: string;
    quantity: number;
    price: number;
}
export declare class CreateSaleDto {
    type: 'cash' | 'credit';
    buyerName?: string;
    comment?: string;
    amountPaid?: number;
    items: CreateSaleItemDto[];
}
