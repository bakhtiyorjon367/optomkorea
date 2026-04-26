import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from '../../libs/dto/transfer.dto';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async create(
    @Body() dto: CreateTransferDto,
    @CurrentUser() user: { id: string },
  ) {
    const transfer = await this.transfersService.create(dto, user.id);
    return { data: transfer };
  }

  @Get('incoming')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async findIncoming(@CurrentUser() user: { id: string }) {
    const transfers = await this.transfersService.findIncoming(user.id);
    return { data: transfers };
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async confirm(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const transfer = await this.transfersService.confirm(id, user.id);
    return { data: transfer };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    const transfers = await this.transfersService.findAll();
    return { data: transfers };
  }
}
