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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = exports.PRODUCT_DELETE_BLOCKED = void 0;
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path = __importStar(require("path"));
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sharp_1 = __importDefault(require("sharp"));
const config_1 = require("../../libs/config");
const product_upload_paths_1 = require("../../libs/product-upload.paths");
exports.PRODUCT_DELETE_BLOCKED = 'PRODUCT_HAS_DEPENDENCIES';
let ProductsService = class ProductsService {
    productModel;
    shipmentModel;
    managerProductModel;
    saleItemModel;
    receiptModel;
    stockTransferModel;
    constructor(productModel, shipmentModel, managerProductModel, saleItemModel, receiptModel, stockTransferModel) {
        this.productModel = productModel;
        this.shipmentModel = shipmentModel;
        this.managerProductModel = managerProductModel;
        this.saleItemModel = saleItemModel;
        this.receiptModel = receiptModel;
        this.stockTransferModel = stockTransferModel;
    }
    async create(dto, userId) {
        return this.productModel.create({
            ...dto,
            createdBy: (0, config_1.shapeIntoMongoObjectId)(userId),
        });
    }
    async findAll(query) {
        const filter = {};
        if (query.category)
            filter.category = query.category;
        if (query.brand)
            filter.brand = query.brand;
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
    async search(q) {
        if (!q || q.length < 2)
            return [];
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
    async findById(id) {
        const product = await this.productModel
            .findById((0, config_1.shapeIntoMongoObjectId)(id))
            .lean()
            .exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async aggregateInventory(productId) {
        const pid = (0, config_1.shapeIntoMongoObjectId)(productId);
        const product = await this.productModel.findById(pid).lean().exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
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
    async aggregateInventoryByManager(productId) {
        const pid = (0, config_1.shapeIntoMongoObjectId)(productId);
        const exists = await this.productModel.exists({ _id: pid }).exec();
        if (!exists)
            throw new common_1.NotFoundException('Product not found');
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
    async update(id, dto) {
        if (dto.images && dto.images.length > 5) {
            throw new common_1.BadRequestException('Maximum 5 images per product');
        }
        const product = await this.productModel
            .findByIdAndUpdate((0, config_1.shapeIntoMongoObjectId)(id), dto, {
            returnDocument: 'after',
        })
            .lean()
            .exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async appendUploadedImages(productId, files) {
        if (!files?.length) {
            throw new common_1.BadRequestException('No image files');
        }
        const oid = (0, config_1.shapeIntoMongoObjectId)(productId);
        const existing = await this.productModel.findById(oid).select('images').lean().exec();
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
        const current = existing.images?.length ?? 0;
        if (current + files.length > 5) {
            throw new common_1.BadRequestException('Maximum 5 images per product');
        }
        const dir = (0, product_upload_paths_1.getProductsUploadAbsoluteDir)();
        await (0, promises_1.mkdir)(dir, { recursive: true });
        const newUrls = [];
        for (const file of files) {
            const id = (0, crypto_1.randomUUID)();
            const base = `${id}.webp`;
            const thumbBase = `${id}_thumb.webp`;
            const dest = path.join(dir, base);
            const destThumb = path.join(dir, thumbBase);
            try {
                await (0, sharp_1.default)(file.buffer)
                    .rotate()
                    .webp({ quality: 86 })
                    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
                    .toFile(dest);
                await (0, sharp_1.default)(file.buffer)
                    .rotate()
                    .resize(80, 80, { fit: 'cover' })
                    .webp({ quality: 82 })
                    .toFile(destThumb);
            }
            catch {
                throw new common_1.BadRequestException('Could not process image; use JPEG, PNG, GIF, or WebP');
            }
            newUrls.push(`${product_upload_paths_1.PRODUCT_UPLOAD_PUBLIC_PREFIX}/${base}`);
        }
        await this.productModel
            .updateOne({ _id: oid }, { $push: { images: { $each: newUrls } } })
            .exec();
        return { urls: newUrls };
    }
    async remove(id) {
        const oid = (0, config_1.shapeIntoMongoObjectId)(id);
        const [shipments, managerRows, saleLines, receipts, transfers] = await Promise.all([
            this.shipmentModel.countDocuments({ productId: oid }).exec(),
            this.managerProductModel.countDocuments({ productId: oid }).exec(),
            this.saleItemModel.countDocuments({ productId: oid }).exec(),
            this.receiptModel.countDocuments({ productId: oid }).exec(),
            this.stockTransferModel.countDocuments({ productId: oid }).exec(),
        ]);
        const blocked = shipments + managerRows + saleLines + receipts + transfers > 0;
        if (blocked) {
            throw new common_1.BadRequestException(`${exports.PRODUCT_DELETE_BLOCKED}: Remove or archive related shipments, stock, sales, receipts, and transfers first.`);
        }
        const result = await this.productModel.findByIdAndDelete(oid).exec();
        if (!result)
            throw new common_1.NotFoundException('Product not found');
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Product')),
    __param(1, (0, mongoose_1.InjectModel)('Shipment')),
    __param(2, (0, mongoose_1.InjectModel)('ManagerProduct')),
    __param(3, (0, mongoose_1.InjectModel)('SaleItem')),
    __param(4, (0, mongoose_1.InjectModel)('Receipt')),
    __param(5, (0, mongoose_1.InjectModel)('StockTransfer')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map