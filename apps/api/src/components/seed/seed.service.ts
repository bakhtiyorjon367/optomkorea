import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import type {
  CategoryDocument,
  FinanceTransactionDocument,
  ManagerProductDocument,
  ProductDocument,
  ReceiptDocument,
  SaleDocument,
  SaleItemDocument,
  ShipmentDocument,
  StockTransferDocument,
  UserDocument,
} from '../../schemas/documents';

const COSMETICS_IMAGES = [
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=400&h=400&fit=crop',
];

const SAMPLE_PRODUCTS = [
  {
    name: 'COSRX Snail Mucin Essence',
    brand: 'COSRX',
    category: 'Skincare',
    description: 'Advanced snail 96 mucin power essence for deep hydration',
    costKrw: 12000,
    sellingPrice: 150000,
  },
  {
    name: 'Laneige Water Sleeping Mask',
    brand: 'Laneige',
    category: 'Skincare',
    description: 'Overnight moisture lock sleeping mask',
    costKrw: 25000,
    sellingPrice: 280000,
  },
  {
    name: 'Innisfree Green Tea Seed Serum',
    brand: 'Innisfree',
    category: 'Skincare',
    description: 'Hydrating serum with Jeju green tea extract',
    costKrw: 18000,
    sellingPrice: 220000,
  },
  {
    name: 'Etude House Drawing Eye Brow',
    brand: 'Etude House',
    category: 'Makeup',
    description: 'Natural-looking eyebrow pencil',
    costKrw: 3500,
    sellingPrice: 45000,
  },
  {
    name: 'Missha M Perfect Cover BB Cream',
    brand: 'Missha',
    category: 'Makeup',
    description: 'Full coverage BB cream SPF42 PA+++',
    costKrw: 8000,
    sellingPrice: 95000,
  },
  {
    name: 'Tony Moly Peach Hand Cream',
    brand: 'Tony Moly',
    category: 'Body Care',
    description: 'Moisturizing peach-shaped hand cream',
    costKrw: 5000,
    sellingPrice: 55000,
  },
  {
    name: 'Sulwhasoo First Care Serum',
    brand: 'Sulwhasoo',
    category: 'Skincare',
    description: 'Signature activating serum with Korean ginseng',
    costKrw: 45000,
    sellingPrice: 480000,
  },
  {
    name: 'Banila Co Clean It Zero',
    brand: 'Banila Co',
    category: 'Skincare',
    description: 'Sherbet-textured cleansing balm',
    costKrw: 15000,
    sellingPrice: 180000,
  },
  {
    name: 'Laneige Lip Sleeping Mask',
    brand: 'Laneige',
    category: 'Lip Care',
    description: 'Berry lip sleeping mask',
    costKrw: 16000,
    sellingPrice: 190000,
  },
  {
    name: 'The Face Shop Rice Water Cleanser',
    brand: 'The Face Shop',
    category: 'Skincare',
    description: 'Brightening rice water cleansing foam',
    costKrw: 6000,
    sellingPrice: 75000,
  },
  {
    name: 'COSRX BHA Blackhead Power Liquid',
    brand: 'COSRX',
    category: 'Skincare',
    description: 'Betaine salicylate exfoliating liquid',
    costKrw: 14000,
    sellingPrice: 165000,
  },
  {
    name: 'Peripera Ink Airy Velvet Tint',
    brand: 'Peripera',
    category: 'Makeup',
    description: 'Lightweight velvet lip tint',
    costKrw: 7000,
    sellingPrice: 85000,
  },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    @InjectModel('ManagerProduct')
    private readonly mpModel: Model<ManagerProductDocument>,
    @InjectModel('Category')
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel('Sale') private readonly saleModel: Model<SaleDocument>,
    @InjectModel('SaleItem')
    private readonly saleItemModel: Model<SaleItemDocument>,
    @InjectModel('FinanceTransaction')
    private readonly ftModel: Model<FinanceTransactionDocument>,
    @InjectModel('Shipment')
    private readonly shipmentModel: Model<ShipmentDocument>,
    @InjectModel('Receipt')
    private readonly receiptModel: Model<ReceiptDocument>,
    @InjectModel('StockTransfer')
    private readonly stockTransferModel: Model<StockTransferDocument>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userModel.countDocuments().exec();
    if (userCount > 0) {
      const hasShipments = await this.shipmentModel.countDocuments().exec();
      if (hasShipments > 0) {
        this.logger.log(
          'Database already seeded with shipments model, skipping',
        );
        return;
      }
      this.logger.log('Old data model found — re-seeding...');
      await this.resetAndSeed();
      return;
    }
    await this.seed();
  }

  async resetAndSeed() {
    await this.userModel.deleteMany({}).exec();
    await this.productModel.deleteMany({}).exec();
    await this.mpModel.deleteMany({}).exec();
    await this.categoryModel.deleteMany({}).exec();
    await this.saleModel.deleteMany({}).exec();
    await this.saleItemModel.deleteMany({}).exec();
    await this.ftModel.deleteMany({}).exec();
    await this.shipmentModel.deleteMany({}).exec();
    await this.receiptModel.deleteMany({}).exec();
    await this.stockTransferModel.deleteMany({}).exec();
    try {
      await this.userModel.collection.dropIndexes();
      await this.mpModel.collection.dropIndexes();
    } catch {
      // Reason: indexes may not exist on fresh collections
    }
    await this.seed();
  }

  private async seed() {
    this.logger.log('Seeding database with sample data...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = await this.userModel.insertMany([
      {
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Boss',
        role: 'admin',
      },
      {
        username: 'manager1',
        password: hashedPassword,
        firstName: 'Aziz',
        lastName: 'Karimov',
        role: 'manager',
      },
      {
        username: 'manager2',
        password: hashedPassword,
        firstName: 'Dilnoza',
        lastName: 'Umarova',
        role: 'manager',
      },
      {
        username: 'user1',
        password: hashedPassword,
        firstName: 'Jasur',
        lastName: 'Toshmatov',
        role: 'user',
      },
      {
        username: 'user2',
        password: hashedPassword,
        firstName: 'Nilufar',
        lastName: 'Rahimova',
        role: 'user',
      },
    ]);

    const admin = users[0];
    const manager1 = users[1];
    const manager2 = users[2];

    const categories = ['Skincare', 'Makeup', 'Body Care', 'Lip Care'];
    await this.categoryModel.insertMany(categories.map((name) => ({ name })));

    const products = await this.productModel.insertMany(
      SAMPLE_PRODUCTS.map((p, i) => ({
        ...p,
        images: [COSMETICS_IMAGES[i % COSMETICS_IMAGES.length]],
        createdBy: admin._id,
      })),
    );

    // Shipment quantities per product (simulates what quantityTotal was)
    const shipmentQtys = [50, 30, 40, 100, 60, 80, 20, 45, 35, 70, 50, 90];

    const shipments = await this.shipmentModel.insertMany(
      products.map((p, i) => ({
        productId: p._id,
        quantityTotal: shipmentQtys[i],
        quantityDistributed: 0,
        costKrwTotal: SAMPLE_PRODUCTS[i].costKrw * shipmentQtys[i],
      })),
    );

    for (let i = 0; i < products.length; i++) {
      await this.productModel.updateOne(
        { _id: products[i]._id },
        { totalShipped: shipmentQtys[i], shippedCount: 1 },
      );
    }

    // Simulate manager receipts from shipments
    const receiptDefs = [
      { shipIdx: 0, manager: manager1, qty: 30 },
      { shipIdx: 0, manager: manager2, qty: 20 },
      { shipIdx: 1, manager: manager1, qty: 30 },
      { shipIdx: 2, manager: manager2, qty: 25 },
      { shipIdx: 3, manager: manager1, qty: 50 },
      { shipIdx: 3, manager: manager2, qty: 50 },
      { shipIdx: 7, manager: manager1, qty: 45 },
      { shipIdx: 8, manager: manager2, qty: 35 },
    ];

    const mpRecords = receiptDefs.map((r) => ({
      productId: products[r.shipIdx]._id,
      managerId: r.manager._id,
      quantityReceived: r.qty,
      quantityAvail: r.qty,
    }));
    await this.mpModel.insertMany(mpRecords);

    await this.receiptModel.insertMany(
      receiptDefs.map((r) => ({
        shipmentId: shipments[r.shipIdx]._id,
        managerId: r.manager._id,
        productId: products[r.shipIdx]._id,
        quantity: r.qty,
      })),
    );

    // Update shipment quantityDistributed
    const distributedByShipment = new Map<number, number>();
    for (const r of receiptDefs) {
      distributedByShipment.set(
        r.shipIdx,
        (distributedByShipment.get(r.shipIdx) ?? 0) + r.qty,
      );
    }
    for (const [idx, distributed] of distributedByShipment) {
      await this.shipmentModel.updateOne(
        { _id: shipments[idx]._id },
        { quantityDistributed: distributed },
      );
    }

    // Set totalAvail on each product
    const availByProduct = new Map<string, number>();
    for (const rec of mpRecords) {
      const pid = String(rec.productId);
      availByProduct.set(
        pid,
        (availByProduct.get(pid) ?? 0) + rec.quantityAvail,
      );
    }
    for (const product of products) {
      const pid = String(product._id);
      const totalAvail = availByProduct.get(pid) ?? 0;
      // Reason: same as live receive — received units match summed manager receipts in seed.
      await this.productModel.updateOne(
        { _id: product._id },
        { totalAvail, totalReceived: totalAvail },
      );
    }

    this.logger.log(
      `Seeded: ${users.length} users, ${products.length} products, ${shipments.length} shipments, ${receiptDefs.length} receipts`,
    );
    this.logger.log('Login credentials — all passwords: 123456');
    this.logger.log('  admin    / 123456 (admin role)');
    this.logger.log('  manager1 / 123456 (manager role)');
    this.logger.log('  manager2 / 123456 (manager role)');
  }
}
