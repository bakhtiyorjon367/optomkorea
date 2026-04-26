import { InjectConnection } from '@nestjs/mongoose';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Logs current MongoDB connection state on startup.
   *
   * Returns:
   *   void
   */
  onModuleInit(): void {
    if (this.connection.readyState === 1) {
      this.logger.log('MongoDB connected successfully');
      return;
    }

    this.logger.warn(`MongoDB connection state: ${this.connection.readyState}`);
  }
}
