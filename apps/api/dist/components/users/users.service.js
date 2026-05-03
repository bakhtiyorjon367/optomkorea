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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const config_1 = require("../../libs/config");
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async upsertFromTelegram(dto) {
        const user = await this.userModel
            .findOneAndUpdate({ telegramId: dto.telegramId }, {
            $set: {
                username: dto.username,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
            $setOnInsert: { role: 'user' },
        }, { upsert: true, returnDocument: 'after' })
            .lean(false)
            .exec();
        if (!user) {
            throw new common_1.InternalServerErrorException('Failed to upsert Telegram user');
        }
        return user;
    }
    async findByUsername(username) {
        return this.userModel.findOne({ username }).lean(false).exec();
    }
    async findById(id) {
        return this.userModel
            .findById((0, config_1.shapeIntoMongoObjectId)(id))
            .lean(false)
            .exec();
    }
    async findAll() {
        return this.userModel
            .find()
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async findByRole(role) {
        return this.userModel
            .find({ role })
            .sort({ firstName: 1 })
            .lean()
            .exec();
    }
    async findManagers(excludeUserId) {
        const filter = { role: 'manager' };
        if (excludeUserId) {
            filter._id = { $ne: (0, config_1.shapeIntoMongoObjectId)(excludeUserId) };
        }
        return this.userModel
            .find(filter)
            .sort({ firstName: 1 })
            .lean()
            .exec();
    }
    async updateRole(userId, role) {
        const user = await this.userModel
            .findByIdAndUpdate((0, config_1.shapeIntoMongoObjectId)(userId), { role }, { returnDocument: 'after' })
            .lean()
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId, updates) {
        const setFields = {};
        if (updates.firstName !== undefined)
            setFields.firstName = updates.firstName;
        if (updates.lastName !== undefined)
            setFields.lastName = updates.lastName;
        const user = await this.userModel
            .findByIdAndUpdate((0, config_1.shapeIntoMongoObjectId)(userId), { $set: setFields }, { returnDocument: 'after' })
            .lean()
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async createWithPassword(username, password, firstName, lastName, role = 'user') {
        const existing = await this.userModel.findOne({ username }).exec();
        if (existing) {
            throw new common_1.BadRequestException('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userModel.create({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            role,
        });
        return user;
    }
    async validatePassword(username, password) {
        const user = await this.userModel.findOne({ username }).lean(false).exec();
        if (!user || !user.password) {
            return null;
        }
        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map