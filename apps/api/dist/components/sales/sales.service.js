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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("../../libs/config");
const mongo_transaction_1 = require("../../libs/mongo-transaction");
const manager_products_service_1 = require("../manager-products/manager-products.service");
let SalesService = class SalesService {
    saleModel;
    saleItemModel;
    productModel;
    connection;
    managerProductsService;
    constructor(saleModel, saleItemModel, productModel, connection, managerProductsService) {
        this.saleModel = saleModel;
        this.saleItemModel = saleItemModel;
        this.productModel = productModel;
        this.connection = connection;
        this.managerProductsService = managerProductsService;
    }
    async create(dto, managerId) {
        if (!dto.items?.length) {
            throw new common_1.BadRequestException('Sale must contain at least one item');
        }
        if (dto.type === 'credit' && !dto.buyerName) {
            throw new common_1.BadRequestException('Buyer name required for credit sales');
        }
        for (const item of dto.items) {
            if (!item.productId)
                throw new common_1.BadRequestException('productId is required');
            if (item.quantity <= 0)
                throw new common_1.BadRequestException('quantity must be > 0');
            if (item.price < 0)
                throw new common_1.BadRequestException('price must be >= 0');
        }
        const uniquePids = [...new Set(dto.items.map((i) => i.productId))];
        const productOids = uniquePids.map((id) => (0, config_1.shapeIntoMongoObjectId)(id));
        const productRows = await this.productModel
            .find({ _id: { $in: productOids } })
            .select('_id sellingPrice')
            .lean()
            .exec();
        if (productRows.length !== uniquePids.length) {
            throw new common_1.BadRequestException('One or more products were not found');
        }
        const sellPriceById = new Map(productRows.map((p) => [String(p._id), p.sellingPrice]));
        for (const item of dto.items) {
            const sp = sellPriceById.get(String((0, config_1.shapeIntoMongoObjectId)(item.productId)));
            if (sp === undefined) {
                throw new common_1.BadRequestException('One or more products were not found');
            }
            if (item.price > sp) {
                throw new common_1.BadRequestException('Unit price must not exceed the product list price (selling price)');
            }
        }
        const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        if (dto.type === 'credit') {
            const initial = dto.amountPaid ?? 0;
            if (initial < 0 || initial > totalAmount) {
                throw new common_1.BadRequestException('Initial payment must be between 0 and the sale total');
            }
        }
        const amountPaidValue = dto.type === 'cash' ? totalAmount : (dto.amountPaid ?? 0);
        const saleStatus = dto.type === 'credit'
            ? amountPaidValue >= totalAmount
                ? 'paid'
                : 'unpaid'
            : 'paid';
        const managerOid = (0, config_1.shapeIntoMongoObjectId)(managerId);
        let sale;
        let items;
        await (0, mongo_transaction_1.runWithReplicaSetTransaction)(this.connection, async (session) => {
            const s = (0, mongo_transaction_1.mongoSessionOpts)(session);
            const [saleDoc] = await this.saleModel.create([
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
            ], s);
            sale = saleDoc;
            items = await this.saleItemModel.insertMany(dto.items.map((item) => ({
                saleId: sale._id,
                productId: (0, config_1.shapeIntoMongoObjectId)(item.productId),
                quantity: item.quantity,
                price: item.price,
            })), s);
            for (const item of dto.items) {
                await this.managerProductsService.updateLocalStock(managerId, item.productId, -item.quantity, session);
                const productOid = (0, config_1.shapeIntoMongoObjectId)(item.productId);
                const productUpdated = await this.productModel.findOneAndUpdate({
                    _id: productOid,
                    totalAvail: { $gte: item.quantity },
                }, {
                    $inc: {
                        totalAvail: -item.quantity,
                        soldCount: item.quantity,
                    },
                }, { ...s, returnDocument: 'after' });
                if (!productUpdated) {
                    throw new common_1.BadRequestException('Insufficient product-level available stock (totalAvail)');
                }
            }
        });
        return { sale: sale, items: items };
    }
    async findByManager(managerId) {
        const sales = await this.saleModel
            .find({ managerId: (0, config_1.shapeIntoMongoObjectId)(managerId) })
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
    async findAll(paymentType) {
        const filter = {};
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
    async findByManagerGrouped(managerId) {
        return this.findByManager(managerId);
    }
    async updateStatus(saleId, status, amountPaid) {
        const update = { status };
        if (amountPaid !== undefined)
            update.amountPaid = amountPaid;
        const sale = await this.saleModel
            .findByIdAndUpdate((0, config_1.shapeIntoMongoObjectId)(saleId), update, {
            returnDocument: 'after',
        })
            .lean()
            .exec();
        if (!sale)
            throw new common_1.NotFoundException('Sale not found');
        return sale;
    }
    async addPayment(saleId, amount, managerId) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Payment amount must be greater than 0');
        }
        const sale = await this.saleModel
            .findById((0, config_1.shapeIntoMongoObjectId)(saleId))
            .exec();
        if (!sale)
            throw new common_1.NotFoundException('Sale not found');
        if (String(sale.managerId) !== managerId) {
            throw new common_1.BadRequestException('You can only update your own sales');
        }
        if (sale.type !== 'credit') {
            throw new common_1.BadRequestException('Only credit sales support incremental payments');
        }
        if (sale.status === 'paid') {
            throw new common_1.BadRequestException('Sale is already fully paid');
        }
        const outstanding = sale.totalAmount - sale.amountPaid;
        if (amount > outstanding) {
            throw new common_1.BadRequestException('Payment amount must not exceed the remaining balance');
        }
        const newAmountPaid = sale.amountPaid + amount;
        const remaining = sale.totalAmount - newAmountPaid;
        const newStatus = remaining <= 0 ? 'paid' : 'unpaid';
        const updated = await this.saleModel
            .findByIdAndUpdate((0, config_1.shapeIntoMongoObjectId)(saleId), { amountPaid: newAmountPaid, status: newStatus }, { returnDocument: 'after' })
            .lean()
            .exec();
        return updated;
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Sale')),
    __param(1, (0, mongoose_1.InjectModel)('SaleItem')),
    __param(2, (0, mongoose_1.InjectModel)('Product')),
    __param(3, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Connection,
        manager_products_service_1.ManagerProductsService])
], SalesService);
//# sourceMappingURL=sales.service.js.map