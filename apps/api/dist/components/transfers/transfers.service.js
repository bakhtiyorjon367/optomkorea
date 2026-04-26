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
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("../../libs/config");
const mongo_transaction_1 = require("../../libs/mongo-transaction");
const manager_products_service_1 = require("../manager-products/manager-products.service");
let TransfersService = class TransfersService {
    transferModel;
    productModel;
    connection;
    managerProductsService;
    constructor(transferModel, productModel, connection, managerProductsService) {
        this.transferModel = transferModel;
        this.productModel = productModel;
        this.connection = connection;
        this.managerProductsService = managerProductsService;
    }
    async create(dto, senderId) {
        const senderOid = (0, config_1.shapeIntoMongoObjectId)(senderId);
        const toOid = (0, config_1.shapeIntoMongoObjectId)(dto.toManagerId);
        if (toOid === senderOid) {
            throw new common_1.BadRequestException('Cannot transfer stock to yourself');
        }
        let transfer = null;
        await (0, mongo_transaction_1.runWithReplicaSetTransaction)(this.connection, async (session) => {
            const s = (0, mongo_transaction_1.mongoSessionOpts)(session);
            const productOid = (0, config_1.shapeIntoMongoObjectId)(dto.productId);
            try {
                await this.managerProductsService.upsertStock(senderId, dto.productId, -dto.quantity, session);
            }
            catch (e) {
                if (e instanceof common_1.BadRequestException) {
                    throw new common_1.BadRequestException('Insufficient stock for transfer');
                }
                throw e;
            }
            await this.productModel.findOneAndUpdate({ _id: productOid }, { $inc: { totalAvail: -dto.quantity, totalReceived: -dto.quantity } }, s);
            const [created] = await this.transferModel.create([
                {
                    fromManagerId: senderOid,
                    toManagerId: toOid,
                    productId: productOid,
                    quantity: dto.quantity,
                    status: 'pending',
                },
            ], s);
            transfer = created;
        });
        return transfer;
    }
    async confirm(transferId, receiverId) {
        const transferOid = (0, config_1.shapeIntoMongoObjectId)(transferId);
        const transfer = await this.transferModel
            .findById(transferOid)
            .exec();
        if (!transfer)
            throw new common_1.NotFoundException('Transfer not found');
        if (String(transfer.toManagerId) !== receiverId) {
            throw new common_1.ForbiddenException('Only the recipient can confirm this transfer');
        }
        if (transfer.status === 'confirmed') {
            throw new common_1.BadRequestException('Transfer already confirmed');
        }
        await (0, mongo_transaction_1.runWithReplicaSetTransaction)(this.connection, async (session) => {
            const s = (0, mongo_transaction_1.mongoSessionOpts)(session);
            await this.managerProductsService.upsertStock(receiverId, String(transfer.productId), transfer.quantity, session);
            await this.productModel.findOneAndUpdate({ _id: (0, config_1.shapeIntoMongoObjectId)(transfer.productId) }, {
                $inc: {
                    totalAvail: transfer.quantity,
                    totalReceived: transfer.quantity,
                },
            }, s);
            transfer.status = 'confirmed';
            transfer.confirmedAt = new Date();
            await transfer.save(s);
        });
        return transfer;
    }
    async findIncoming(managerId) {
        const oid = (0, config_1.shapeIntoMongoObjectId)(managerId);
        const toManagerIn = [oid, managerId];
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
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('StockTransfer')),
    __param(1, (0, mongoose_1.InjectModel)('Product')),
    __param(2, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Connection,
        manager_products_service_1.ManagerProductsService])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map