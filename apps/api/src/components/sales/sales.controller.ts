import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SalesService } from './sales.service';
import { CreateSaleDto } from '../../libs/dto/sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async create(
    @Body() dto: CreateSaleDto,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.salesService.create(dto, user.id);
    return { data: result };
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentUser() user: { id: string }) {
    const sales = await this.salesService.findByManager(user.id);
    return { data: sales };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(@Query('paymentType') paymentType?: 'cash' | 'credit') {
    const sales = await this.salesService.findAll(paymentType);
    return { data: sales };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'paid' | 'unpaid',
    @Body('amountPaid') amountPaid?: number,
  ) {
    const sale = await this.salesService.updateStatus(id, status, amountPaid);
    return { data: sale };
  }

  @Patch(':id/payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async addPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @CurrentUser() user: { id: string },
  ) {
    const sale = await this.salesService.addPayment(id, amount, user.id);
    return { data: sale };
  }
}
