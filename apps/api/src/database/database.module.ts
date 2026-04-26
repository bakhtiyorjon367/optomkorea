import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import CategorySchema from '../schemas/Category.model';
import FinanceTransactionSchema from '../schemas/FinanceTransaction.model';
import ManagerProductSchema from '../schemas/ManagerProduct.model';
import ProductSchema from '../schemas/Product.model';
import ReceiptSchema from '../schemas/Receipt.model';
import SaleSchema from '../schemas/Sale.model';
import SaleItemSchema from '../schemas/SaleItem.model';
import ShipmentSchema from '../schemas/Shipment.model';
import StockTransferSchema from '../schemas/StockTransfer.model';
import UserSchema from '../schemas/User.model';
import { DatabaseService } from './database.service';

/**
 * Single place for Mongoose schema registration.
 *
 * `@Global()` + `forFeature` lets feature modules inject any `@InjectModel()`
 * without each module repeating `MongooseModule.forFeature([...])`.
 * `ComponentsModule` only bundles Nest modules; it does not register models.
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI') ?? '';
        const dbName =
          configService.get<string>('MONGODB_DB_NAME') ?? 'optom_korea';
        return {
          uri: mongoUri,
          dbName,
        };
      },
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'ManagerProduct', schema: ManagerProductSchema },
      { name: 'Category', schema: CategorySchema },
      { name: 'Sale', schema: SaleSchema },
      { name: 'SaleItem', schema: SaleItemSchema },
      { name: 'FinanceTransaction', schema: FinanceTransactionSchema },
      { name: 'Shipment', schema: ShipmentSchema },
      { name: 'Receipt', schema: ReceiptSchema },
      { name: 'StockTransfer', schema: StockTransferSchema },
    ]),
  ],
  providers: [DatabaseService],
  exports: [MongooseModule, DatabaseService],
})
export class DatabaseModule {}
