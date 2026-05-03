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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("../../libs/config");
let FinanceService = class FinanceService {
    txModel;
    constructor(txModel) {
        this.txModel = txModel;
    }
    async create(dto, recordedBy) {
        return this.txModel.create({
            type: dto.type,
            managerId: (0, config_1.shapeIntoMongoObjectId)(dto.managerId),
            amount: dto.amount,
            note: dto.note ?? '',
            transactionDate: dto.transactionDate
                ? new Date(dto.transactionDate)
                : new Date(),
            recordedBy: (0, config_1.shapeIntoMongoObjectId)(recordedBy),
        });
    }
    async findAll(managerId) {
        const filter = managerId
            ? { managerId: (0, config_1.shapeIntoMongoObjectId)(managerId) }
            : {};
        return this.txModel
            .find(filter)
            .populate('managerId', 'firstName lastName username role')
            .sort({ transactionDate: -1 })
            .lean()
            .exec();
    }
    async getBalance(managerId) {
        const transactions = await this.txModel
            .find({ managerId: (0, config_1.shapeIntoMongoObjectId)(managerId) })
            .lean()
            .exec();
        let totalGiven = 0;
        let totalReceived = 0;
        for (const tx of transactions) {
            if (tx.type === 'admin_gave')
                totalGiven += tx.amount;
            else
                totalReceived += tx.amount;
        }
        return {
            managerId,
            totalGiven,
            totalReceived,
            net: totalGiven - totalReceived,
        };
    }
    async getAllBalances() {
        const transactions = await this.txModel
            .find()
            .populate('managerId', 'firstName lastName username role')
            .lean()
            .exec();
        const balanceMap = new Map();
        for (const tx of transactions) {
            const mid = String(tx.managerId &&
                typeof tx.managerId === 'object' &&
                '_id' in tx.managerId
                ? tx.managerId._id
                : tx.managerId);
            if (!balanceMap.has(mid)) {
                balanceMap.set(mid, {
                    managerId: mid,
                    manager: tx.managerId,
                    totalGiven: 0,
                    totalReceived: 0,
                });
            }
            const entry = balanceMap.get(mid);
            if (tx.type === 'admin_gave')
                entry.totalGiven += tx.amount;
            else
                entry.totalReceived += tx.amount;
        }
        return Array.from(balanceMap.values()).map((b) => ({
            ...b,
            net: b.totalGiven - b.totalReceived,
        }));
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('FinanceTransaction')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FinanceService);
//# sourceMappingURL=finance.service.js.map