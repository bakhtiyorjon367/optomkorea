import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from '../../libs/dto/finance.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: { id: string },
  ) {
    const tx = await this.financeService.create(dto, user.id);
    return { data: tx };
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(@Query('managerId') managerId?: string) {
    const transactions = await this.financeService.findAll(managerId);
    return { data: transactions };
  }

  @Get('balance/:managerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getBalance(@Param('managerId') managerId: string) {
    const balance = await this.financeService.getBalance(managerId);
    return { data: balance };
  }

  @Get('balances')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllBalances() {
    const balances = await this.financeService.getAllBalances();
    return { data: balances };
  }
}
