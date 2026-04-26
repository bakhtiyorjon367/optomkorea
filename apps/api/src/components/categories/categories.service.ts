import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import type { CategoryDocument } from '../../schemas/documents';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category')
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(name: string): Promise<CategoryDocument> {
    const existing = await this.categoryModel.findOne({ name }).lean().exec();
    if (existing) {
      throw new BadRequestException('Category already exists');
    }
    return this.categoryModel.create({ name });
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find()
      .sort({ name: 1 })
      .lean()
      .exec() as unknown as CategoryDocument[];
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel
      .findByIdAndDelete(shapeIntoMongoObjectId(id))
      .exec();
    if (!result) throw new NotFoundException('Category not found');
  }
}
