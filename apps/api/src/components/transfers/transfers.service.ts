import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import type { ProductDocument, StockTransferDocument } from '../../schemas/documents';
import { CreateTransferDto } from '../../libs/dto/transfer.dto';
import {
  mongoSessionOpts,
  runWithReplicaSetTransaction,
} from '../../libs/mongo-transaction';
import { ManagerProductsService } from '../manager-products/manager-products.service';

@Injectable()
export class TransfersService {
  constructor(
    @InjectModel('StockTransfer')
    private readonly transferModel: Model<StockTransferDocument>,
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly managerProductsService: ManagerProductsService,
  ) {}

  /**
   * Initiates a product transfer from sender to another manager. Uses
   * conditional findOneAndUpdate to atomically decrement sender stock
   * and Product.totalAvail.
   *
   * Args:
   *   dto (CreateTransferDto): Transfer details.
   *   senderId (string): Initiating manager's user ID.
   *
   * Returns:
   *   StockTransferDocument: Created transfer record.
   */
  async create(
    dto: CreateTransferDto,
    senderId: string,
  ): Promise<StockTransferDocument> {
    const senderOid = shapeIntoMongoObjectId(senderId);
    const toOid = shapeIntoMongoObjectId(dto.toManagerId);
    if (toOid === senderOid) {
      throw new BadRequestException('Cannot transfer stock to yourself');
    }

    let transfer: StockTransferDocument | null = null;

    await runWithReplicaSetTransaction(this.connection, async (session) => {
      const s = mongoSessionOpts(session);
      const productOid = shapeIntoMongoObjectId(dto.productId);
      try {
        await this.managerProductsService.upsertStock(
          senderId,
          dto.productId,
          -dto.quantity,
          session,
        );
      } catch (e) {
        if (e instanceof BadRequestException) {
          throw new BadRequestException('Insufficient stock for transfer');
        }
        throw e;
      }

      await this.productModel.findOneAndUpdate(
        { _id: productOid },
        { $inc: { totalAvail: -dto.quantity, totalReceived: -dto.quantity } },
        s,
      );

      const [created] = await this.transferModel.create(
        [
          {
            fromManagerId: senderOid,
            toManagerId: toOid,
            productId: productOid,
            quantity: dto.quantity,
            status: 'pending',
          },
        ],
        s,
      );
      transfer = created;
    });

    return transfer!;
  }

  /**
   * Receiver confirms an incoming transfer. Uses upsert with $inc to
   * atomically credit receiver's stock and Product.totalAvail.
   *
   * Args:
   *   transferId (string): Transfer record ID.
   *   receiverId (string): Confirming manager's user ID.
   *
   * Returns:
   *   StockTransferDocument: Updated transfer record.
   */
  async confirm(
    transferId: string,
    receiverId: string,
  ): Promise<StockTransferDocument> {
    const transferOid = shapeIntoMongoObjectId(transferId);
    const transfer = await this.transferModel
      .findById(transferOid)
      .exec();
    if (!transfer) throw new NotFoundException('Transfer not found');

    if (String(transfer.toManagerId) !== receiverId) {
      throw new ForbiddenException(
        'Only the recipient can confirm this transfer',
      );
    }
    if (transfer.status === 'confirmed') {
      throw new BadRequestException('Transfer already confirmed');
    }

    await runWithReplicaSetTransaction(this.connection, async (session) => {
      const s = mongoSessionOpts(session);
      await this.managerProductsService.upsertStock(
        receiverId,
        String(transfer.productId),
        transfer.quantity,
        session,
      );

      await this.productModel.findOneAndUpdate(
        { _id: shapeIntoMongoObjectId(transfer.productId) },
        {
          $inc: {
            totalAvail: transfer.quantity,
            totalReceived: transfer.quantity,
          },
        },
        s,
      );

      transfer.status = 'confirmed';
      transfer.confirmedAt = new Date();
      await transfer.save(s);
    });

    return transfer;
  }

  /**
   * Returns pending incoming transfers for a manager.
   *
   * Args:
   *   managerId (string): Recipient manager ID.
   *
   * Returns:
   *   Array of pending StockTransferDocuments.
   */
  async findIncoming(managerId: string) {
    const oid = shapeIntoMongoObjectId(managerId);
    const toManagerIn: (Types.ObjectId | string)[] = [oid, managerId];
    return this.transferModel
      .find({
        status: 'pending',
        toManagerId: { $in: toManagerIn },
      })
      .populate('fromManagerId', 'firstName lastName username role')
      .populate('productId', 'name brand images sellingPrice')
      .sort({ initiatedAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Returns all transfers (admin view).
   *
   * Returns:
   *   Array of all StockTransferDocuments.
   */
  async findAll() {
    return this.transferModel
      .find()
      .populate('fromManagerId', 'firstName lastName username role')
      .populate('toManagerId', 'firstName lastName username role')
      .populate('productId', 'name brand images sellingPrice')
      .sort({ initiatedAt: -1 })
      .lean()
      .exec();
  }
}
