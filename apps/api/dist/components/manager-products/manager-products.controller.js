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
exports.ManagerProductsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const manager_products_service_1 = require("./manager-products.service");
const shipments_service_1 = require("../shipments/shipments.service");
const manager_product_dto_1 = require("../../libs/dto/manager-product.dto");
let ManagerProductsController = class ManagerProductsController {
    mpService;
    shipmentsService;
    constructor(mpService, shipmentsService) {
        this.mpService = mpService;
        this.shipmentsService = shipmentsService;
    }
    async receive(dto, user) {
        const mp = await this.shipmentsService.receive(dto.shipmentId, user.id, dto.quantity);
        return { data: mp };
    }
    async findMine(user) {
        const mps = await this.mpService.findByManager(user.id);
        return { data: mps };
    }
    async findAll(managerId) {
        const mps = await this.mpService.findAll(managerId ? { managerId } : undefined);
        return { data: mps };
    }
};
exports.ManagerProductsController = ManagerProductsController;
__decorate([
    (0, common_1.Post)('receive'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('manager'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [manager_product_dto_1.ReceiveProductDto, Object]),
    __metadata("design:returntype", Promise)
], ManagerProductsController.prototype, "receive", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManagerProductsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Query)('managerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManagerProductsController.prototype, "findAll", null);
exports.ManagerProductsController = ManagerProductsController = __decorate([
    (0, common_1.Controller)('manager-products'),
    __metadata("design:paramtypes", [manager_products_service_1.ManagerProductsService,
        shipments_service_1.ShipmentsService])
], ManagerProductsController);
//# sourceMappingURL=manager-products.controller.js.map