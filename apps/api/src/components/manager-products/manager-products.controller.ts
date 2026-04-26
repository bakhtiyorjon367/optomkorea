import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ManagerProductsService } from './manager-products.service';
import { ShipmentsService } from '../shipments/shipments.service';
import { ReceiveProductDto } from '../../libs/dto/manager-product.dto';

@Controller('manager-products')
export class ManagerProductsController {
  constructor(
    private readonly mpService: ManagerProductsService,
    private readonly shipmentsService: ShipmentsService,
  ) {}

  @Post('receive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async receive(
    @Body() dto: ReceiveProductDto,
    @CurrentUser() user: { id: string },
  ) {
    const mp = await this.shipmentsService.receive(
      dto.shipmentId,
      user.id,
      dto.quantity,
    );
    return { data: mp };
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentUser() user: { id: string }) {
    const mps = await this.mpService.findByManager(user.id);
    return { data: mps };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(@Query('managerId') managerId?: string) {
    const mps = await this.mpService.findAll(
      managerId ? { managerId } : undefined,
    );
    return { data: mps };
  }
}
