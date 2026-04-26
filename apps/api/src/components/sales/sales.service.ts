import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import type {
  ProductDocument,
  SaleDocument,
  SaleItemDocument,
} from '../../schemas/documents';
import { CreateSaleDto } from '../../libs/dto/sale.dto';
import {
  mongoSessionOpts,
  runWithReplicaSetTransaction,
} from '../../libs/mongo-transaction';
import { ManagerProductsService } from '../manager-products/manager-products.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel('Sale') private readonly saleModel: Model<SaleDocument>,
    @InjectModel('SaleItem')
    private readonly saleItemModel: Model<SaleItemDocument>,
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly managerProductsService: ManagerProductsService,
  ) {}

  async create(dto: CreateSaleDto, managerId: string) {
    if (!dto.items?.length) {
      throw new BadRequestException('Sale must contain at least one item');
    }
    if (dto.type === 'credit' && !dto.buyerName) {
      throw new BadRequestException('Buyer name required for credit sales');
    }

    for (const item of dto.items) {
      if (!item.productId)
        throw new BadRequestException('productId is required');
      if (item.quantity <= 0)
        throw new BadRequestException('quantity must be > 0');
      if (item.price < 0) throw new BadRequestException('price must be >= 0');
    }

    const uniquePids = [...new Set(dto.items.map((i) => i.productId))];
    const productOids = uniquePids.map((id) => shapeIntoMongoObjectId(id));
    const productRows = await this.productModel
      .find({ _id: { $in: productOids } })
      .select('_id sellingPrice')
      .lean()
      .exec();
    if (productRows.length !== uniquePids.length) {
      throw new BadRequestException('One or more products were not found');
    }
    const sellPriceById = new Map(
      productRows.map((p) => [String(p._id), p.sellingPrice as number]),
    );
    for (const item of dto.items) {
      const sp = sellPriceById.get(String(shapeIntoMongoObjectId(item.productId)));
      if (sp === undefined) {
        throw new BadRequestException('One or more products were not found');
      }
      if (item.price > sp) {
        throw new BadRequestException(
          'Unit price must not exceed the product list price (selling price)',
        );
      }
    }

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    if (dto.type === 'credit') {
      const initial = dto.amountPaid ?? 0;
      if (initial < 0 || initial > totalAmount) {
        throw new BadRequestException(
          'Initial payment must be between 0 and the sale total',
        );
      }
    }

    const amountPaidValue =
      dto.type === 'cash' ? totalAmount : (dto.amountPaid ?? 0);
    const saleStatus: 'paid' | 'unpaid' =
      dto.type === 'credit'
        ? amountPaidValue >= totalAmount
          ? 'paid'
          : 'unpaid'
        : 'paid';

    const managerOid = shapeIntoMongoObjectId(managerId);

    let sale: SaleDocument;
    let items: SaleItemDocument[];

    await runWithReplicaSetTransaction(this.connection, async (session) => {
      const s = mongoSessionOpts(session);
      const [saleDoc] = await this.saleModel.create(
        [
          {
            type: dto.type,
            managerId: managerOid,
            buyerName: dto.buyerName ?? '',
            comment: dto.comment ?? '',
            status: saleStatus,
            totalAmount,
            amountPaid: amountPaidValue,
            itemCount: dto.items.length,
          },
        ],
        s,
      );
      sale = saleDoc;

      items = await this.saleItemModel.insertMany(
        dto.items.map((item) => ({
          saleId: sale._id,
          productId: shapeIntoMongoObjectId(item.productId),
          quantity: item.quantity,
          price: item.price,
        })),
        s,
      );

      for (const item of dto.items) {
        await this.managerProductsService.updateLocalStock(
          managerId,
          item.productId,
          -item.quantity,
          session,
        );

        const productOid = shapeIntoMongoObjectId(item.productId);
        const productUpdated = await this.productModel.findOneAndUpdate(
          {
            _id: productOid,
            totalAvail: { $gte: item.quantity },
          },
          {
            $inc: {
              totalAvail: -item.quantity,
              soldCount: item.quantity,
            },
          },
          { ...s, returnDocument: 'after' },
        );
        if (!productUpdated) {
          throw new BadRequestException(
            'Insufficient product-level available stock (totalAvail)',
          );
        }
      }
    });

    return { sale: sale!, items: items! };
  }

  async findByManager(managerId: string) {
    const sales = await this.saleModel
      .find({ managerId: shapeIntoMongoObjectId(managerId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const saleIds = sales.map((s) => s._id);
    const items = await this.saleItemModel
      .find({ saleId: { $in: saleIds } })
      .populate('productId')
      .lean()
      .exec();

    return sales.map((sale) => ({
      ...sale,
      items: items.filter((i) => String(i.saleId) === String(sale._id)),
    }));
  }

  async findAll(paymentType?: 'cash' | 'credit') {
    const filter: Record<string, unknown> = {};
    if (paymentType) {
      filter.type = paymentType;
    }

    const sales = await this.saleModel
      .find(filter)
      .populate('managerId', 'firstName lastName username role')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const saleIds = sales.map((s) => s._id);
    const items = await this.saleItemModel
      .find({ saleId: { $in: saleIds } })
      .populate('productId')
      .lean()
      .exec();

    return sales.map((sale) => ({
      ...sale,
      items: items.filter((i) => String(i.saleId) === String(sale._id)),
    }));
  }

  async findByManagerGrouped(managerId: string) {
    return this.findByManager(managerId);
  }

  async updateStatus(
    saleId: string,
    status: 'paid' | 'unpaid',
    amountPaid?: number,
  ) {
    const update: Record<string, unknown> = { status };
    if (amountPaid !== undefined) update.amountPaid = amountPaid;

    const sale = await this.saleModel
      .findByIdAndUpdate(shapeIntoMongoObjectId(saleId), update, {
        returnDocument: 'after',
      })
      .lean()
      .exec();
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  /**
   * Manager adds an incremental payment to their own credit sale.
   * Automatically sets status to 'paid' when amountPaid >= totalAmount.
   */
  async addPayment(saleId: string, amount: number, managerId: string) {
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const sale = await this.saleModel
      .findById(shapeIntoMongoObjectId(saleId))
      .exec();
    if (!sale) throw new NotFoundException('Sale not found');

    if (String(sale.managerId) !== managerId) {
      throw new BadRequestException('You can only update your own sales');
    }
    if (sale.type !== 'credit') {
      throw new BadRequestException(
        'Only credit sales support incremental payments',
      );
    }
    if (sale.status === 'paid') {
      throw new BadRequestException('Sale is already fully paid');
    }

    const outstanding = sale.totalAmount - sale.amountPaid;
    if (amount > outstanding) {
      throw new BadRequestException(
        'Payment amount must not exceed the remaining balance',
      );
    }

    const newAmountPaid = sale.amountPaid + amount;
    const remaining = sale.totalAmount - newAmountPaid;
    const newStatus = remaining <= 0 ? 'paid' : 'unpaid';

    const updated = await this.saleModel
      .findByIdAndUpdate(
        shapeIntoMongoObjectId(saleId),
        { amountPaid: newAmountPaid, status: newStatus },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();

    return updated;
  }
}
