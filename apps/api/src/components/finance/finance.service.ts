import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import type { FinanceTransactionDocument } from '../../schemas/documents';
import { CreateTransactionDto } from '../../libs/dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel('FinanceTransaction')
    private readonly txModel: Model<FinanceTransactionDocument>,
  ) {}

  async create(dto: CreateTransactionDto, recordedBy: string) {
    return this.txModel.create({
      type: dto.type,
      managerId: shapeIntoMongoObjectId(dto.managerId),
      amount: dto.amount,
      note: dto.note ?? '',
      transactionDate: dto.transactionDate
        ? new Date(dto.transactionDate)
        : new Date(),
      recordedBy: shapeIntoMongoObjectId(recordedBy),
    });
  }

  async findAll(managerId?: string) {
    const filter = managerId
      ? { managerId: shapeIntoMongoObjectId(managerId) }
      : {};
    return this.txModel
      .find(filter)
      .populate('managerId', 'firstName lastName username role')
      .sort({ transactionDate: -1 })
      .lean()
      .exec();
  }

  async getBalance(managerId: string) {
    const transactions = await this.txModel
      .find({ managerId: shapeIntoMongoObjectId(managerId) })
      .lean()
      .exec();

    let totalGiven = 0;
    let totalReceived = 0;

    for (const tx of transactions) {
      if (tx.type === 'admin_gave') totalGiven += tx.amount;
      else totalReceived += tx.amount;
    }

    return {
      managerId,
      totalGiven,
      totalReceived,
      net: totalGiven - totalReceived,
    };
  }

  async getAllBalances() {
    const transactions = await this.txModel
      .find()
      .populate('managerId', 'firstName lastName username role')
      .lean()
      .exec();

    const balanceMap = new Map<
      string,
      {
        managerId: string;
        manager: unknown;
        totalGiven: number;
        totalReceived: number;
      }
    >();

    for (const tx of transactions) {
      const mid = String(
        tx.managerId &&
          typeof tx.managerId === 'object' &&
          '_id' in tx.managerId
          ? tx.managerId._id
          : tx.managerId,
      );
      if (!balanceMap.has(mid)) {
        balanceMap.set(mid, {
          managerId: mid,
          manager: tx.managerId,
          totalGiven: 0,
          totalReceived: 0,
        });
      }
      const entry = balanceMap.get(mid)!;
      if (tx.type === 'admin_gave') entry.totalGiven += tx.amount;
      else entry.totalReceived += tx.amount;
    }

    return Array.from(balanceMap.values()).map((b) => ({
      ...b,
      net: b.totalGiven - b.totalReceived,
    }));
  }
}
