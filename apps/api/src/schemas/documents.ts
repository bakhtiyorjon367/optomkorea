import type { HydratedDocument, InferSchemaType } from 'mongoose';
import CategorySchema from './Category.model';
import FinanceTransactionSchema from './FinanceTransaction.model';
import ManagerProductSchema from './ManagerProduct.model';
import ProductSchema from './Product.model';
import ReceiptSchema from './Receipt.model';
import SaleSchema from './Sale.model';
import SaleItemSchema from './SaleItem.model';
import ShipmentSchema from './Shipment.model';
import StockTransferSchema from './StockTransfer.model';
import UserSchema from './User.model';

export type CategoryDocument = HydratedDocument<
  InferSchemaType<typeof CategorySchema>
>;
export type UserDocument = HydratedDocument<InferSchemaType<typeof UserSchema>>;
export type ProductDocument = HydratedDocument<
  InferSchemaType<typeof ProductSchema>
>;
export type ShipmentDocument = HydratedDocument<
  InferSchemaType<typeof ShipmentSchema>
>;
export type ReceiptDocument = HydratedDocument<
  InferSchemaType<typeof ReceiptSchema>
>;
export type ManagerProductDocument = HydratedDocument<
  InferSchemaType<typeof ManagerProductSchema>
>;
export type SaleDocument = HydratedDocument<InferSchemaType<typeof SaleSchema>>;
export type SaleItemDocument = HydratedDocument<
  InferSchemaType<typeof SaleItemSchema>
>;
export type StockTransferDocument = HydratedDocument<
  InferSchemaType<typeof StockTransferSchema>
>;
export type FinanceTransactionDocument = HydratedDocument<
  InferSchemaType<typeof FinanceTransactionSchema>
>;
