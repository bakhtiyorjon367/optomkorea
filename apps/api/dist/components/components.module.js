"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentsModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const categories_module_1 = require("./categories/categories.module");
const products_module_1 = require("./products/products.module");
const manager_products_module_1 = require("./manager-products/manager-products.module");
const sales_module_1 = require("./sales/sales.module");
const shipments_module_1 = require("./shipments/shipments.module");
const transfers_module_1 = require("./transfers/transfers.module");
const finance_module_1 = require("./finance/finance.module");
const users_module_1 = require("./users/users.module");
const seed_module_1 = require("./seed/seed.module");
let ComponentsModule = class ComponentsModule {
};
exports.ComponentsModule = ComponentsModule;
exports.ComponentsModule = ComponentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            manager_products_module_1.ManagerProductsModule,
            sales_module_1.SalesModule,
            shipments_module_1.ShipmentsModule,
            transfers_module_1.TransfersModule,
            finance_module_1.FinanceModule,
            users_module_1.UsersModule,
            seed_module_1.SeedModule,
        ],
    })
], ComponentsModule);
//# sourceMappingURL=components.module.js.map