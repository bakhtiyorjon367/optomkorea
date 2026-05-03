"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
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
let SeedService = SeedService_1 = class SeedService {
    userModel;
    productModel;
    mpModel;
    categoryModel;
    saleModel;
    saleItemModel;
    ftModel;
    shipmentModel;
    receiptModel;
    stockTransferModel;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(userModel, productModel, mpModel, categoryModel, saleModel, saleItemModel, ftModel, shipmentModel, receiptModel, stockTransferModel) {
        this.userModel = userModel;
        this.productModel = productModel;
        this.mpModel = mpModel;
        this.categoryModel = categoryModel;
        this.saleModel = saleModel;
        this.saleItemModel = saleItemModel;
        this.ftModel = ftModel;
        this.shipmentModel = shipmentModel;
        this.receiptModel = receiptModel;
        this.stockTransferModel = stockTransferModel;
    }
    async onModuleInit() {
        const userCount = await this.userModel.countDocuments().exec();
        if (userCount > 0) {
            const hasShipments = await this.shipmentModel.countDocuments().exec();
            if (hasShipments > 0) {
                this.logger.log('Database already seeded with shipments model, skipping');
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
        }
        catch {
        }
        await this.seed();
    }
    async seed() {
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
        const products = await this.productModel.insertMany(SAMPLE_PRODUCTS.map((p, i) => ({
            ...p,
            images: [COSMETICS_IMAGES[i % COSMETICS_IMAGES.length]],
            createdBy: admin._id,
        })));
        const shipmentQtys = [50, 30, 40, 100, 60, 80, 20, 45, 35, 70, 50, 90];
        const shipments = await this.shipmentModel.insertMany(products.map((p, i) => ({
            productId: p._id,
            quantityTotal: shipmentQtys[i],
            quantityDistributed: 0,
            costKrwTotal: SAMPLE_PRODUCTS[i].costKrw * shipmentQtys[i],
        })));
        for (let i = 0; i < products.length; i++) {
            await this.productModel.updateOne({ _id: products[i]._id }, { totalShipped: shipmentQtys[i], shippedCount: 1 });
        }
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
        await this.receiptModel.insertMany(receiptDefs.map((r) => ({
            shipmentId: shipments[r.shipIdx]._id,
            managerId: r.manager._id,
            productId: products[r.shipIdx]._id,
            quantity: r.qty,
        })));
        const distributedByShipment = new Map();
        for (const r of receiptDefs) {
            distributedByShipment.set(r.shipIdx, (distributedByShipment.get(r.shipIdx) ?? 0) + r.qty);
        }
        for (const [idx, distributed] of distributedByShipment) {
            await this.shipmentModel.updateOne({ _id: shipments[idx]._id }, { quantityDistributed: distributed });
        }
        const availByProduct = new Map();
        for (const rec of mpRecords) {
            const pid = String(rec.productId);
            availByProduct.set(pid, (availByProduct.get(pid) ?? 0) + rec.quantityAvail);
        }
        for (const product of products) {
            const pid = String(product._id);
            const totalAvail = availByProduct.get(pid) ?? 0;
            await this.productModel.updateOne({ _id: product._id }, { totalAvail, totalReceived: totalAvail });
        }
        this.logger.log(`Seeded: ${users.length} users, ${products.length} products, ${shipments.length} shipments, ${receiptDefs.length} receipts`);
        this.logger.log('Login credentials — all passwords: 123456');
        this.logger.log('  admin    / 123456 (admin role)');
        this.logger.log('  manager1 / 123456 (manager role)');
        this.logger.log('  manager2 / 123456 (manager role)');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __param(1, (0, mongoose_1.InjectModel)('Product')),
    __param(2, (0, mongoose_1.InjectModel)('ManagerProduct')),
    __param(3, (0, mongoose_1.InjectModel)('Category')),
    __param(4, (0, mongoose_1.InjectModel)('Sale')),
    __param(5, (0, mongoose_1.InjectModel)('SaleItem')),
    __param(6, (0, mongoose_1.InjectModel)('FinanceTransaction')),
    __param(7, (0, mongoose_1.InjectModel)('Shipment')),
    __param(8, (0, mongoose_1.InjectModel)('Receipt')),
    __param(9, (0, mongoose_1.InjectModel)('StockTransfer')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SeedService);
//# sourceMappingURL=seed.service.js.map