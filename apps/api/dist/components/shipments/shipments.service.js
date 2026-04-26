"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsService = exports.partialDistributionShipmentFilter = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("../../libs/config");
const mongo_transaction_1 = require("../../libs/mongo-transaction");
const manager_products_service_1 = require("../manager-products/manager-products.service");
exports.partialDistributionShipmentFilter = {
    $expr: {
        $and: [
            { $gt: ['$quantityDistributed', 0] },
            { $lt: ['$quantityDistributed', '$quantityTotal'] },
        ],
    },
};
let ShipmentsService = class ShipmentsService {
    shipmentModel;
    receiptModel;
    productModel;
    connection;
    managerProductsService;
    constructor(shipmentModel, receiptModel, productModel, connection, managerProductsService) {
        this.shipmentModel = shipmentModel;
        this.receiptModel = receiptModel;
        this.productModel = productModel;
        this.connection = connection;
        this.managerProductsService = managerProductsService;
    }
    async receive(shipmentId, managerId, quantity) {
        if (quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than 0');
        }
        let productId = '';
        await (0, mongo_transaction_1.runWithReplicaSetTransaction)(this.connection, async (session) => {
            const s = (0, mongo_transaction_1.mongoSessionOpts)(session);
            const shipment = (await this.shipmentModel.findOneAndUpdate({
                _id: (0, config_1.shapeIntoMongoObjectId)(shipmentId),
                $expr: {
                    $lte: [
                        { $add: ['$quantityDistributed', quantity] },
                        '$quantityTotal',
                    ],
                },
            }, { $inc: { quantityDistributed: quantity } }, { ...s, returnDocument: 'after' }));
            if (!shipment) {
                throw new common_1.BadRequestException('Not enough remaining in this shipment');
            }
            productId = String(shipment.productId);
            const productOid = (0, config_1.shapeIntoMongoObjectId)(shipment.productId);
            const managerOid = (0, config_1.shapeIntoMongoObjectId)(managerId);
            await this.managerProductsService.upsertStock(managerId, productId.toString(), quantity, session);
            await this.receiptModel.findOneAndUpdate({
                shipmentId: (0, config_1.shapeIntoMongoObjectId)(shipmentId),
                managerId: managerOid,
            }, {
                $inc: { quantity },
                $setOnInsert: { productId: productOid, receivedAt: new Date() },
            }, { ...s, upsert: true, returnDocument: 'after' });
            const productUpdated = await this.productModel.findOneAndUpdate({ _id: productOid }, { $inc: { totalReceived: quantity, totalAvail: quantity } }, { ...s, returnDocument: 'after' });
            if (!productUpdated) {
                throw new common_1.BadRequestException('Product not found');
            }
        });
        return this.managerProductsService.findPopulatedByManagerAndProduct(managerId, productId);
    }
    async create(dto, createdByUserId) {
        const productOid = (0, config_1.shapeIntoMongoObjectId)(dto.productId);
        let created = null;
        await (0, mongo_transaction_1.runWithReplicaSetTransaction)(this.connection, async (session) => {
            const s = (0, mongo_transaction_1.mongoSessionOpts)(session);
            const [shipment] = await this.shipmentModel.create([
                {
                    productId: productOid,
                    quantityTotal: dto.quantityTotal,
                    quantityDistributed: 0,
                    costKrwTotal: dto.costKrwTotal ?? 0,
                    notes: dto.notes ?? '',
                    ...(createdByUserId
                        ? { createdBy: (0, config_1.shapeIntoMongoObjectId)(createdByUserId) }
                        : {}),
                },
            ], s);
            created = shipment;
            const product = await this.productModel.findOneAndUpdate({ _id: productOid }, {
                $inc: {
                    totalShipped: dto.quantityTotal,
                    shippedCount: 1,
                },
            }, { ...s, returnDocument: 'after' });
            if (!product) {
                await this.shipmentModel.deleteOne({ _id: shipment._id }, s);
                throw new common_1.NotFoundException('Product not found');
            }
        });
        return created;
    }
    async findAll(productId, distribution) {
        const filter = {};
        if (productId)
            filter.productId = (0, config_1.shapeIntoMongoObjectId)(productId);
        if (distribution === 'partial') {
            Object.assign(filter, exports.partialDistributionShipmentFilter);
        }
        const shipments = await this.shipmentModel
            .find(filter)
            .populate('productId', 'name images totalShipped shippedCount')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return shipments.map((s) => {
            const rawPid = s.productId;
            let productIdStr = '';
            let productSummary;
            if (rawPid !== null &&
                rawPid !== undefined &&
                typeof rawPid === 'object' &&
                '_id' in rawPid) {
                const p = rawPid;
                productIdStr = String(p._id);
                productSummary = {
                    name: String(p.name ?? ''),
                    images: p.images ?? [],
                    totalShipped: Number(p.totalShipped ?? 0),
                    shippedCount: Number(p.shippedCount ?? 0),
                };
            }
            else if (rawPid !== null && rawPid !== undefined) {
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
    async findReceiptsByShipment(shipmentId) {
        const shipment = await this.shipmentModel
            .findById((0, config_1.shapeIntoMongoObjectId)(shipmentId))
            .lean()
            .exec();
        if (!shipment)
            throw new common_1.NotFoundException('Shipment not found');
        return this.receiptModel
            .find({ shipmentId: (0, config_1.shapeIntoMongoObjectId)(shipmentId) })
            .populate('managerId', 'firstName lastName username role')
            .populate('productId', 'name brand images')
            .sort({ receivedAt: -1 })
            .lean()
            .exec();
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Shipment')),
    __param(1, (0, mongoose_1.InjectModel)('Receipt')),
    __param(2, (0, mongoose_1.InjectModel)('Product')),
    __param(3, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Connection,
        manager_products_service_1.ManagerProductsService])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map