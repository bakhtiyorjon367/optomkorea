import { Module } from '@nestjs/common';
import { ManagerProductsModule } from '../manager-products/manager-products.module';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';

@Module({
  imports: [ManagerProductsModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
