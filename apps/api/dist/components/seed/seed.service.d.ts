import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import type { CategoryDocument, FinanceTransactionDocument, ManagerProductDocument, ProductDocument, ReceiptDocument, SaleDocument, SaleItemDocument, ShipmentDocument, StockTransferDocument, UserDocument } from '../../schemas/documents';
export declare class SeedService implements OnModuleInit {
    private readonly userModel;
    private readonly productModel;
    private readonly mpModel;
    private readonly categoryModel;
    private readonly saleModel;
    private readonly saleItemModel;
    private readonly ftModel;
    private readonly shipmentModel;
    private readonly receiptModel;
    private readonly stockTransferModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, productModel: Model<ProductDocument>, mpModel: Model<ManagerProductDocument>, categoryModel: Model<CategoryDocument>, saleModel: Model<SaleDocument>, saleItemModel: Model<SaleItemDocument>, ftModel: Model<FinanceTransactionDocument>, shipmentModel: Model<ShipmentDocument>, receiptModel: Model<ReceiptDocument>, stockTransferModel: Model<StockTransferDocument>);
    onModuleInit(): Promise<void>;
    resetAndSeed(): Promise<void>;
    private seed;
}
