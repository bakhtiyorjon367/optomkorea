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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    configService;
    jwtService;
    usersService;
    constructor(configService, jwtService, usersService) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    async loginWithPassword(username, password) {
        const user = await this.usersService.validatePassword(username, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const token = await this.jwtService.signAsync({
            sub: String(user._id),
            role: user.role,
        });
        return {
            token,
            user: {
                id: String(user._id),
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
            },
        };
    }
    async loginWithTelegram(payload) {
        const id = this.getRequiredString(payload, 'id');
        const firstName = this.getRequiredString(payload, 'first_name');
        const lastName = this.getOptionalString(payload, 'last_name');
        const username = this.getOptionalString(payload, 'username');
        this.verifyTelegramSignature(payload);
        const user = await this.usersService.upsertFromTelegram({
            telegramId: Number(id),
            firstName,
            lastName,
            username,
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Unable to authenticate user');
        }
        const token = await this.jwtService.signAsync({
            sub: String(user._id),
            role: user.role,
        });
        return {
            token,
            user: {
                id: String(user._id),
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
            },
        };
    }
    verifyTelegramSignature(payload) {
        const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!botToken) {
            throw new common_1.BadRequestException('TELEGRAM_BOT_TOKEN is not configured');
        }
        const payloadEntries = Object.entries(payload).filter(([key, value]) => {
            if (key === 'hash')
                return false;
            return value !== undefined && value !== null && String(value) !== '';
        });
        const dataCheckString = payloadEntries
            .map(([key, value]) => `${key}=${String(value)}`)
            .sort()
            .join('\n');
        const secretKey = (0, crypto_1.createHash)('sha256').update(botToken).digest();
        const computedHash = (0, crypto_1.createHmac)('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
        const providedHash = this.getRequiredString(payload, 'hash');
        const isValid = providedHash.length === computedHash.length &&
            (0, crypto_1.timingSafeEqual)(Buffer.from(providedHash, 'utf8'), Buffer.from(computedHash, 'utf8'));
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid Telegram login signature');
        }
    }
    getRequiredString(payload, key) {
        const value = payload[key];
        if (value === undefined || value === null || String(value) === '') {
            throw new common_1.BadRequestException(`${key} is required`);
        }
        return String(value);
    }
    getOptionalString(payload, key) {
        const value = payload[key];
        if (value === undefined || value === null || String(value) === '') {
            return undefined;
        }
        return String(value);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map