import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';
import * as path from 'path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import sharp from 'sharp';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { CreateProductDto, UpdateProductDto } from '../../libs/dto/product.dto';
import { getProductsUploadAbsoluteDir, PRODUCT_UPLOAD_PUBLIC_PREFIX } from '../../libs/product-upload.paths';
import type {
  ManagerProductDocument,
  ProductDocument,
  ReceiptDocument,
  SaleItemDocument,
  ShipmentDocument,
  StockTransferDocument,
} from '../../schemas/documents';

/** Prefix for client-side i18n when delete is blocked by existing inventory or history. */
export const PRODUCT_DELETE_BLOCKED = 'PRODUCT_HAS_DEPENDENCIES';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    @InjectModel('Shipment')
    private readonly shipmentModel: Model<ShipmentDocument>,
    @InjectModel('ManagerProduct')
    private readonly managerProductModel: Model<ManagerProductDocument>,
    @InjectModel('SaleItem')
    private readonly saleItemModel: Model<SaleItemDocument>,
    @InjectModel('Receipt')
    private readonly receiptModel: Model<ReceiptDocument>,
    @InjectModel('StockTransfer')
    private readonly stockTransferModel: Model<StockTransferDocument>,
  ) {}

  async create(
    dto: CreateProductDto,
    userId: string,
  ): Promise<ProductDocument> {
    return this.productModel.create({
      ...dto,
      createdBy: shapeIntoMongoObjectId(userId),
    });
  }

  async findAll(query: {
    category?: string;
    brand?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;
    if (query.brand) filter.brand = query.brand;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { brand: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return { data, meta: { total, page, limit } };
  }

  /**
   * Searches products by name/brand substring for autocomplete.
   *
   * Args:
   *   q (string): Search query, min 2 chars.
   *
   * Returns:
   *   Array of matching products, max 10.
   */
  async search(q: string) {
    if (!q || q.length < 2) return [];
    return this.productModel
      .find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
        ],
      })
      .limit(10)
      .lean()
      .exec();
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(shapeIntoMongoObjectId(id))
      .lean()
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product as unknown as ProductDocument;
  }

  /**
   * Reads denormalized inventory counters from the Product document (kept in sync on ship/receive/sell).
   *
   * Args:
   *   productId (string): Product id.
   *
   * Returns:
   *   object: Shipped/received/sold/availability and inTransit units.
   */
  async aggregateInventory(productId: string) {
    const pid = shapeIntoMongoObjectId(productId);
    const product = await this.productModel.findById(pid).lean().exec();
    if (!product) throw new NotFoundException('Product not found');

    const totalShipped = Number(product.totalShipped ?? 0);
    const shippedCount = Number(product.shippedCount ?? 0);
    const totalReceived = Number(product.totalReceived ?? 0);
    const totalSold = Number(product.soldCount ?? 0);
    const totalAvail = Number(product.totalAvail ?? 0);

    return {
      totalShipped,
      shippedCount,
      totalReceived,
      totalSold,
      totalAvail,
      inTransit: Math.max(0, totalShipped - totalReceived),
    };
  }

  /**
   * Per-manager inventory rows for admin (received, avail, implied sold).
   *
   * Args:
   *   productId (string): Product id.
   *
   * Returns:
   *   Array of { manager, received, avail, sold } objects.
   */
  async aggregateInventoryByManager(productId: string) {
    const pid = shapeIntoMongoObjectId(productId);
    const exists = await this.productModel.exists({ _id: pid }).exec();
    if (!exists) throw new NotFoundException('Product not found');

    const rows = await this.managerProductModel
      .find({ productId: pid })
      .populate('managerId', 'firstName lastName _id')
      .lean()
      .exec();

    return rows.map((row) => ({
      manager: row.managerId,
      received: row.quantityReceived,
      avail: row.quantityAvail,
      sold: Math.max(0, row.quantityReceived - row.quantityAvail),
    }));
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    if (dto.images && dto.images.length > 5) {
      throw new BadRequestException('Maximum 5 images per product');
    }
    const product = await this.productModel
      .findByIdAndUpdate(shapeIntoMongoObjectId(id), dto, {
        returnDocument: 'after',
      })
      .lean()
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product as unknown as ProductDocument;
  }

  /**
   * Saves uploaded image buffers to disk (WebP), writes an 80×80 cover thumb, appends URLs to the product.
   *
   * Args:
   *   productId (string): Product id.
   *   files (Express.Multer.File[]): In-memory multipart files (images only).
   *
   * Returns:
   *   { urls: string[] }: New public paths under `/uploads/products/`.
   */
  async appendUploadedImages(
    productId: string,
    files: Express.Multer.File[],
  ): Promise<{ urls: string[] }> {
    if (!files?.length) {
      throw new BadRequestException('No image files');
    }
    const oid = shapeIntoMongoObjectId(productId);
    const existing = await this.productModel.findById(oid).select('images').lean().exec();
    if (!existing) throw new NotFoundException('Product not found');
    const current = (existing.images as string[])?.length ?? 0;
    if (current + files.length > 5) {
      throw new BadRequestException('Maximum 5 images per product');
    }

    const dir = getProductsUploadAbsoluteDir();
    await mkdir(dir, { recursive: true });

    const newUrls: string[] = [];
    for (const file of files) {
      const id = randomUUID();
      const base = `${id}.webp`;
      const thumbBase = `${id}_thumb.webp`;
      const dest = path.join(dir, base);
      const destThumb = path.join(dir, thumbBase);

      try {
        await sharp(file.buffer)
          .rotate()
          .webp({ quality: 86 })
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .toFile(dest);

        await sharp(file.buffer)
          .rotate()
          .resize(80, 80, { fit: 'cover' })
          .webp({ quality: 82 })
          .toFile(destThumb);
      } catch {
        throw new BadRequestException('Could not process image; use JPEG, PNG, GIF, or WebP');
      }

      newUrls.push(`${PRODUCT_UPLOAD_PUBLIC_PREFIX}/${base}`);
    }

    await this.productModel
      .updateOne({ _id: oid }, { $push: { images: { $each: newUrls } } })
      .exec();

    return { urls: newUrls };
  }

  /**
   * Deletes a product document only when no related inventory or history rows exist.
   *
   * MongoDB has no FK cascade; without this guard, deleting the product would leave
   * orphaned refs on shipments, manager stock, sale line items, receipts, and transfers.
   *
   * Args:
   *   id (string): Product id.
   *
   * Returns:
   *   void
   */
  async remove(id: string): Promise<void> {
    const oid = shapeIntoMongoObjectId(id);
    const [shipments, managerRows, saleLines, receipts, transfers] =
      await Promise.all([
        this.shipmentModel.countDocuments({ productId: oid }).exec(),
        this.managerProductModel.countDocuments({ productId: oid }).exec(),
        this.saleItemModel.countDocuments({ productId: oid }).exec(),
        this.receiptModel.countDocuments({ productId: oid }).exec(),
        this.stockTransferModel.countDocuments({ productId: oid }).exec(),
      ]);
    const blocked =
      shipments + managerRows + saleLines + receipts + transfers > 0;
    if (blocked) {
      throw new BadRequestException(
        `${PRODUCT_DELETE_BLOCKED}: Remove or archive related shipments, stock, sales, receipts, and transfers first.`,
      );
    }
    const result = await this.productModel.findByIdAndDelete(oid).exec();
    if (!result) throw new NotFoundException('Product not found');
  }
}
