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
exports.ManagerProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("../../libs/config");
let ManagerProductsService = class ManagerProductsService {
    mpModel;
    constructor(mpModel) {
        this.mpModel = mpModel;
    }
    async upsertStock(managerId, productId, qty, session) {
        if (qty === 0)
            return;
        const filter = {
            managerId: new mongoose_2.Types.ObjectId(managerId.toString()),
            productId: new mongoose_2.Types.ObjectId(productId.toString()),
        };
        if (qty < 0) {
            const need = Math.abs(qty);
            filter.quantityAvail = { $gte: need };
            filter.quantityReceived = { $gte: need };
        }
        const opts = { upsert: qty > 0, returnDocument: 'after' };
        if (session)
            opts.session = session;
        const updated = await this.mpModel.findOneAndUpdate(filter, {
            $inc: {
                quantityAvail: qty,
                quantityReceived: qty,
            },
            $setOnInsert: {
                managerId: new mongoose_2.Types.ObjectId(managerId.toString()),
                productId: new mongoose_2.Types.ObjectId(productId.toString()),
            },
        }, opts);
        if (!updated && qty < 0) {
            throw new common_1.BadRequestException('Insufficient stock available');
        }
    }
    async findPopulatedByManagerAndProduct(managerId, productId) {
        return this.mpModel
            .findOne({
            productId: (0, config_1.shapeIntoMongoObjectId)(productId),
            managerId: (0, config_1.shapeIntoMongoObjectId)(managerId),
        })
            .populate('productId')
            .populate('managerId', 'firstName lastName username role')
            .lean()
            .exec();
    }
    async updateLocalStock(managerId, productId, qty, session) {
        if (qty === 0)
            return;
        const filter = {
            managerId: new mongoose_2.Types.ObjectId(managerId),
            productId: new mongoose_2.Types.ObjectId(productId),
        };
        if (qty < 0) {
            filter.quantityAvail = { $gte: Math.abs(qty) };
        }
        const opts = { returnDocument: 'after' };
        if (session)
            opts.session = session;
        const updated = await this.mpModel.findOneAndUpdate(filter, { $inc: { quantityAvail: qty } }, opts);
        if (!updated && qty < 0) {
            throw new common_1.BadRequestException('Insufficient stock available');
        }
    }
    async findAll(query) {
        const filter = {};
        if (query?.managerId) {
            filter.managerId = new mongoose_2.Types.ObjectId(query.managerId.toString());
        }
        return this.mpModel
            .find(filter)
            .populate('productId', 'name images sellingPrice costKrw totalShipped totalAvail totalReceived shippedCount soldCount')
            .populate('managerId', 'firstName lastName username role')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async findByManager(managerId) {
        return this.mpModel
            .find({ managerId: (0, config_1.shapeIntoMongoObjectId)(managerId) })
            .populate('productId')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
};
exports.ManagerProductsService = ManagerProductsService;
exports.ManagerProductsService = ManagerProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('ManagerProduct')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ManagerProductsService);
//# sourceMappingURL=manager-products.service.js.map