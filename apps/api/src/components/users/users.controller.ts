import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from '../../libs/dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() reqUser: { id: string; role: string }) {
    const user = await this.usersService.findById(reqUser.id);
    return { data: user };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() reqUser: { id: string; role: string },
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(reqUser.id, dto);
    return { data: user };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    const users = await this.usersService.findAll();
    return { data: users };
  }

  @Get('managers')
  @UseGuards(JwtAuthGuard)
  async findManagers(
    @CurrentUser() reqUser: { id: string },
    @Query('excludeSelf') excludeSelf?: string,
  ) {
    const omitSelf = excludeSelf === 'true' || excludeSelf === '1';
    const managers = await this.usersService.findManagers(
      omitSelf ? reqUser.id : undefined,
    );
    return { data: managers };
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: 'admin' | 'manager' | 'user',
  ) {
    const user = await this.usersService.updateRole(id, role);
    return { data: user };
  }
}
