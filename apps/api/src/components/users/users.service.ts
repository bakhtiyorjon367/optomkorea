import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { UpsertTelegramUserDto } from '../../libs/dto/user.dto';
import type { UserDocument } from '../../schemas/documents';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async upsertFromTelegram(dto: UpsertTelegramUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findOneAndUpdate(
        { telegramId: dto.telegramId },
        {
          $set: {
            username: dto.username,
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
          $setOnInsert: { role: 'user' },
        },
        { upsert: true, returnDocument: 'after' },
      )
      .lean(false)
      .exec();

    if (!user) {
      throw new InternalServerErrorException('Failed to upsert Telegram user');
    }
    return user;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).lean(false).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(shapeIntoMongoObjectId(id))
      .lean(false)
      .exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec() as unknown as UserDocument[];
  }

  async findByRole(role: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ role })
      .sort({ firstName: 1 })
      .lean()
      .exec() as unknown as UserDocument[];
  }

  /**
   * Lists users with role manager, optionally excluding one user id (e.g. transfer recipient list).
   *
   * Args:
   *   excludeUserId (string | undefined): Mongo user id to omit from results.
   *
   * Returns:
   *   UserDocument[]: Lean manager rows.
   */
  async findManagers(excludeUserId?: string): Promise<UserDocument[]> {
    const filter: Record<string, unknown> = { role: 'manager' };
    if (excludeUserId) {
      filter._id = { $ne: shapeIntoMongoObjectId(excludeUserId) };
    }
    return this.userModel
      .find(filter)
      .sort({ firstName: 1 })
      .lean()
      .exec() as unknown as UserDocument[];
  }

  async updateRole(
    userId: string,
    role: 'admin' | 'manager' | 'user',
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        shapeIntoMongoObjectId(userId),
        { role },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as unknown as UserDocument;
  }

  async updateProfile(
    userId: string,
    updates: { firstName?: string; lastName?: string },
  ): Promise<UserDocument> {
    const setFields: Record<string, string> = {};
    if (updates.firstName !== undefined)
      setFields.firstName = updates.firstName;
    if (updates.lastName !== undefined) setFields.lastName = updates.lastName;

    const user = await this.userModel
      .findByIdAndUpdate(
        shapeIntoMongoObjectId(userId),
        { $set: setFields },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user as unknown as UserDocument;
  }

  async createWithPassword(
    username: string,
    password: string,
    firstName: string,
    lastName?: string,
    role: 'admin' | 'manager' | 'user' = 'user',
  ): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ username }).exec();
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });
    return user;
  }

  async validatePassword(
    username: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ username }).lean(false).exec();
    if (!user || !user.password) {
      return null;
    }
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}
