import { Module, forwardRef } from '@nestjs/common';
import { ManagerProductsService } from './manager-products.service';
import { ManagerProductsController } from './manager-products.controller';
import { ShipmentsModule } from '../shipments/shipments.module';

@Module({
  imports: [forwardRef(() => ShipmentsModule)],
  controllers: [ManagerProductsController],
  providers: [ManagerProductsService],
  exports: [ManagerProductsService],
})
export class ManagerProductsModule {}
