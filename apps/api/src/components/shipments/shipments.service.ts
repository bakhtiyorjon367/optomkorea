import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import type {
  ManagerProductDocument,
  ProductDocument,
  ReceiptDocument,
  ShipmentDocument,
} from '../../schemas/documents';
import { CreateShipmentDto } from '../../libs/dto/shipment.dto';
import {
  mongoSessionOpts,
  runWithReplicaSetTransaction,
} from '../../libs/mongo-transaction';
import { ManagerProductsService } from '../manager-products/manager-products.service';

/** Shipment with at least one unit distributed but not fully distributed. Keep in sync with admin partial product filter. */
export const partialDistributionShipmentFilter = {
  $expr: {
    $and: [
      { $gt: ['$quantityDistributed', 0] },
      { $lt: ['$quantityDistributed', '$quantityTotal'] },
    ],
  },
} as const;

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectModel('Shipment')
    private readonly shipmentModel: Model<ShipmentDocument>,
    @InjectModel('Receipt')
    private readonly receiptModel: Model<ReceiptDocument>,
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly managerProductsService: ManagerProductsService,
  ) {}

  /**
   * Manager receives stock from a shipment. Atomic session: claim shipment qty,
   * upsert manager_products, upsert receipt.
   *
   * Args:
   *   shipmentId (string): Source shipment.
   *   managerId (string): Receiving manager.
   *   quantity (number): Units to receive.
   *
   * Returns:
   *   ManagerProductDocument: Updated inventory row.
   */
  async receive(
    shipmentId: string,
    managerId: string,
    quantity: number,
  ): Promise<ManagerProductDocument> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    let productId = '';

    await runWithReplicaSetTransaction(this.connection, async (session) => {
      const s = mongoSessionOpts(session);
      // Reason: atomic $expr guard prevents two managers from over-claiming
      const shipment = (await this.shipmentModel.findOneAndUpdate(
        {
          _id: shapeIntoMongoObjectId(shipmentId),
          $expr: {
            $lte: [
              { $add: ['$quantityDistributed', quantity] },
              '$quantityTotal',
            ],
          },
        },
        { $inc: { quantityDistributed: quantity } },
        { ...s, returnDocument: 'after' },
      )) as ShipmentDocument | null;
      if (!shipment) {
        throw new BadRequestException('Not enough remaining in this shipment');
      }

      productId = String(shipment.productId);
      const productOid = shapeIntoMongoObjectId(shipment.productId);
      const managerOid = shapeIntoMongoObjectId(managerId);

      // Reason: upsert with $inc avoids read-then-write race on manager_products
      await this.managerProductsService.upsertStock(
        managerId,
        productId.toString(),
        quantity,
        session,
      );

      await this.receiptModel.findOneAndUpdate(
        {
          shipmentId: shapeIntoMongoObjectId(shipmentId),
          managerId: managerOid,
        },
        {
          $inc: { quantity },
          $setOnInsert: { productId: productOid, receivedAt: new Date() },
        },
        { ...s, upsert: true, returnDocument: 'after' },
      );

      const productUpdated = await this.productModel.findOneAndUpdate(
        { _id: productOid },
        { $inc: { totalReceived: quantity, totalAvail: quantity } },
        { ...s, returnDocument: 'after' },
      );
      if (!productUpdated) {
        throw new BadRequestException('Product not found');
      }
    });

    return this.managerProductsService.findPopulatedByManagerAndProduct(
      managerId,
      productId,
    );
  }

  /**
   * Persists a shipment row and increments Product totalShipped / shippedCount.
   *
   * Args:
   *   dto (CreateShipmentDto): Shipment details.
   *   createdByUserId (string | undefined): Admin user id when known.
   *
   * Returns:
   *   ShipmentDocument: Created shipment.
   */
  async create(
    dto: CreateShipmentDto,
    createdByUserId?: string,
  ): Promise<ShipmentDocument> {
    const productOid = shapeIntoMongoObjectId(dto.productId);
    let created: ShipmentDocument | null = null;

    await runWithReplicaSetTransaction(this.connection, async (session) => {
      const s = mongoSessionOpts(session);
      const [shipment] = await this.shipmentModel.create(
        [
          {
            productId: productOid,
            quantityTotal: dto.quantityTotal,
            quantityDistributed: 0,
            costKrwTotal: dto.costKrwTotal ?? 0,
            notes: dto.notes ?? '',
            ...(createdByUserId
              ? { createdBy: shapeIntoMongoObjectId(createdByUserId) }
              : {}),
          },
        ],
        s,
      );
      created = shipment;

      const product = await this.productModel.findOneAndUpdate(
        { _id: productOid },
        {
          $inc: {
            totalShipped: dto.quantityTotal,
            shippedCount: 1,
          },
        },
        { ...s, returnDocument: 'after' },
      );
      if (!product) {
        await this.shipmentModel.deleteOne({ _id: shipment._id }, s);
        throw new NotFoundException('Product not found');
      }
    });

    return created!;
  }

  /**
   * Returns all shipments with computed quantityRemaining, optionally filtered by productId
   * and/or partial distribution state.
   *
   * Args:
   *   productId (string | undefined): Optional product filter.
   *   distribution (string | undefined): When `'partial'`, only partially distributed shipments.
   *
   * Returns:
   *   Array of shipments with quantityRemaining and nested product summary.
   */
  async findAll(productId?: string, distribution?: string) {
    const filter: Record<string, unknown> = {};
    if (productId) filter.productId = shapeIntoMongoObjectId(productId);
    if (distribution === 'partial') {
      Object.assign(filter, partialDistributionShipmentFilter);
    }

    const shipments = await this.shipmentModel
      .find(filter)
      .populate('productId', 'name images totalShipped shippedCount')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return shipments.map((s) => {
      const rawPid = s.productId as unknown;
      let productIdStr = '';
      let productSummary:
        | {
            name: string;
            images: string[];
            totalShipped: number;
            shippedCount: number;
          }
        | undefined;

      if (
        rawPid !== null &&
        rawPid !== undefined &&
        typeof rawPid === 'object' &&
        '_id' in rawPid
      ) {
        const p = rawPid as Record<string, unknown>;
        productIdStr = String(p._id);
        productSummary = {
          name: String(p.name ?? ''),
          images: (p.images as string[]) ?? [],
          totalShipped: Number(p.totalShipped ?? 0),
          shippedCount: Number(p.shippedCount ?? 0),
        };
      } else if (rawPid !== null && rawPid !== undefined) {
        productIdStr = String(rawPid);
      }

      return {
        ...s,
        productId: productIdStr,
        product: productSummary,
        quantityRemaining: s.quantityTotal - s.quantityDistributed,
      };
    });
  }

  /**
   * Returns shipments where quantityDistributed < quantityTotal (still has stock to claim).
   *
   * Returns:
   *   Array of available shipments with quantityRemaining.
   */
  async findAvailable() {
    const shipments = await this.shipmentModel
      .find({
        $expr: {
          $gt: [{ $subtract: ['$quantityTotal', '$quantityDistributed'] }, 0],
        },
      })
      .populate('productId', 'name brand images sellingPrice')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return shipments.map((s) => ({
      ...s,
      quantityRemaining: s.quantityTotal - s.quantityDistributed,
    }));
  }

  /**
   * Returns all receipts for a given shipment.
   *
   * Args:
   *   shipmentId (string): Shipment ID.
   *
   * Returns:
   *   Array of receipt documents.
   */
  async findReceiptsByShipment(shipmentId: string) {
    const shipment = await this.shipmentModel
      .findById(shapeIntoMongoObjectId(shipmentId))
      .lean()
      .exec();
    if (!shipment) throw new NotFoundException('Shipment not found');

    return this.receiptModel
      .find({ shipmentId: shapeIntoMongoObjectId(shipmentId) })
      .populate('managerId', 'firstName lastName username role')
      .populate('productId', 'name brand images')
      .sort({ receivedAt: -1 })
      .lean()
      .exec();
  }
}
