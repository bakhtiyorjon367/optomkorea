import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from '../../libs/dto/shipment.dto';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @Body() dto: CreateShipmentDto,
    @CurrentUser() user: { id: string },
  ) {
    const shipment = await this.shipmentsService.create(dto, user.id);
    return { data: shipment };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(
    @Query('productId') productId?: string,
    @Query('distribution') distribution?: string,
  ) {
    const shipments = await this.shipmentsService.findAll(
      productId,
      distribution,
    );
    return { data: shipments };
  }

  @Get('available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async findAvailable() {
    const shipments = await this.shipmentsService.findAvailable();
    return { data: shipments };
  }

  @Get(':id/receipts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findReceipts(@Param('id') id: string) {
    const receipts = await this.shipmentsService.findReceiptsByShipment(id);
    return { data: receipts };
  }
}
