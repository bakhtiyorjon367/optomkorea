import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type ClientSession, Model, Types } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import type { ManagerProductDocument } from '../../schemas/documents';

//api/src/components/manager-products/manager-products.service.ts
@Injectable()
export class ManagerProductsService {
  constructor(
    @InjectModel('ManagerProduct')
    private readonly mpModel: Model<ManagerProductDocument>,
  ) {}

  /**
   * Upserts manager_products with quantity delta; quantityReceived moves with quantityAvail
   * (shipments/transfers) so totals stay aligned.
   *
   * Args:
   *   managerId (string): Manager user id.
   *   productId (string): Product id.
   *   qty (number): Delta applied to quantityAvail and quantityReceived; negative decrements with guard.
   *   session (ClientSession | undefined): Optional Mongo session for atomic workflows.
   *
   * Returns:
   *   void
   *
   * Throws:
   *   BadRequestException: When decrementing and insufficient quantityAvail / quantityReceived.
   */
  async upsertStock(
    managerId: string,
    productId: string,
    qty: number,
    session?: ClientSession,
  ): Promise<void> {
    if (qty === 0) return;

    const filter: Record<string, unknown> = {
      managerId: new Types.ObjectId(managerId.toString()),
      productId: new Types.ObjectId(productId.toString()),
    };

    if (qty < 0) {
      const need = Math.abs(qty);
      filter.quantityAvail = { $gte: need };
      filter.quantityReceived = { $gte: need };
    }

    // Reason: transfer-out decrements must not upsert a new row when sender has no inventory doc.
    const opts: Record<string, unknown> = { upsert: qty > 0, returnDocument: 'after' };
    if (session) opts.session = session;

    const updated = await this.mpModel.findOneAndUpdate(
      filter,
      {
        $inc: {
          quantityAvail: qty,
          quantityReceived: qty,
        },
        $setOnInsert: {
          managerId: new Types.ObjectId(managerId.toString()),
          productId: new Types.ObjectId(productId.toString()),
        },
      },
      opts,
    );

    if (!updated && qty < 0) {
      throw new BadRequestException('Insufficient stock available');
    }
  }

  /**
   * Returns one manager-product row with product and manager populated (e.g. after receive).
   *
   * Args:
   *   managerId (string): Manager id.
   *   productId (string): Product id.
   *
   * Returns:
   *   ManagerProductDocument: Lean row cast for API response shape.
   */
  async findPopulatedByManagerAndProduct(
    managerId: string,
    productId: string,
  ): Promise<ManagerProductDocument> {
    return this.mpModel
      .findOne({
        productId: shapeIntoMongoObjectId(productId),
        managerId: shapeIntoMongoObjectId(managerId),
      })
      .populate('productId')
      .populate('managerId', 'firstName lastName username role')
      .lean()
      .exec() as unknown as ManagerProductDocument;
  }

  /**
   * Atomically adjusts this manager's `quantityAvail` by `qty` (negative sells).
   *
   * Args:
   *   managerId (string): Manager user id.
   *   productId (string): Product id.
   *   qty (number): Delta; negative decrements, positive increments.
   *   session (ClientSession | undefined): Mongo session for transactional sales.
   *
   * Returns:
   *   void
   *
   * Throws:
   *   BadRequestException: On insufficient stock when decrementing.
   */
  async updateLocalStock(
    managerId: string,
    productId: string,
    qty: number,
    session?: ClientSession,
  ): Promise<void> {
    if (qty === 0) return;

    const filter: Record<string, unknown> = {
      managerId: new Types.ObjectId(managerId),
      productId: new Types.ObjectId(productId),
    };

    if (qty < 0) {
      filter.quantityAvail = { $gte: Math.abs(qty) };
    }

    const opts: Record<string, unknown> = { returnDocument: 'after' };
    if (session) opts.session = session;

    const updated = await this.mpModel.findOneAndUpdate(
      filter,
      { $inc: { quantityAvail: qty } },
      opts,
    );

    if (!updated && qty < 0) {
      throw new BadRequestException('Insufficient stock available');
    }
  }

  /**
   * Returns all manager-product inventory rows (admin). Optional managerId
   * filters to one manager; refs are populated for list UI.
   *
   * Args:
   *   query (object): Optional `managerId` hex string.
   *
   * Returns:
   *   Array of lean ManagerProduct rows with populated productId and managerId.
   */
  async findAll(query?: { managerId?: string }) {
    const filter: Record<string, unknown> = {};
    if (query?.managerId) {
      filter.managerId = new Types.ObjectId(query.managerId.toString());
    }
    return this.mpModel
      .find(filter)
      .populate(
        'productId',
        'name images sellingPrice costKrw totalShipped totalAvail totalReceived shippedCount soldCount',
      )
      .populate('managerId', 'firstName lastName username role')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Returns inventory rows for a specific manager.
   *
   * Args:
   *   managerId (string): Manager user ID.
   *
   * Returns:
   *   Array of ManagerProductDocument.
   */
  async findByManager(managerId: string) {
    return this.mpModel
      .find({ managerId: shapeIntoMongoObjectId(managerId) })
      .populate('productId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
