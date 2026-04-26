import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ManagerProductsModule } from './manager-products/manager-products.module';
import { SalesModule } from './sales/sales.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { TransfersModule } from './transfers/transfers.module';
import { FinanceModule } from './finance/finance.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ManagerProductsModule,
    SalesModule,
    ShipmentsModule,
    TransfersModule,
    FinanceModule,
    UsersModule,
    SeedModule,
  ],
})
export class ComponentsModule {}
