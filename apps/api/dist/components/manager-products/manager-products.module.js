"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerProductsModule = void 0;
const common_1 = require("@nestjs/common");
const manager_products_service_1 = require("./manager-products.service");
const manager_products_controller_1 = require("./manager-products.controller");
const shipments_module_1 = require("../shipments/shipments.module");
let ManagerProductsModule = class ManagerProductsModule {
};
exports.ManagerProductsModule = ManagerProductsModule;
exports.ManagerProductsModule = ManagerProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => shipments_module_1.ShipmentsModule)],
        controllers: [manager_products_controller_1.ManagerProductsController],
        providers: [manager_products_service_1.ManagerProductsService],
        exports: [manager_products_service_1.ManagerProductsService],
    })
], ManagerProductsModule);
//# sourceMappingURL=manager-products.module.js.map