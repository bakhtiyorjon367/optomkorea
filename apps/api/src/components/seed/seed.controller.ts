import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('reset')
  async reset() {
    await this.seedService.resetAndSeed();
    return { data: { message: 'Database reset and seeded successfully' } };
  }
}
