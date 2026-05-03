"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const Category_model_1 = __importDefault(require("../schemas/Category.model"));
const FinanceTransaction_model_1 = __importDefault(require("../schemas/FinanceTransaction.model"));
const ManagerProduct_model_1 = __importDefault(require("../schemas/ManagerProduct.model"));
const Product_model_1 = __importDefault(require("../schemas/Product.model"));
const Receipt_model_1 = __importDefault(require("../schemas/Receipt.model"));
const Sale_model_1 = __importDefault(require("../schemas/Sale.model"));
const SaleItem_model_1 = __importDefault(require("../schemas/SaleItem.model"));
const Shipment_model_1 = __importDefault(require("../schemas/Shipment.model"));
const StockTransfer_model_1 = __importDefault(require("../schemas/StockTransfer.model"));
const User_model_1 = __importDefault(require("../schemas/User.model"));
const database_service_1 = require("./database.service");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const mongoUri = configService.get('MONGODB_URI') ?? '';
                    const dbName = configService.get('MONGODB_DB_NAME') ?? 'optom_korea';
                    return {
                        uri: mongoUri,
                        dbName,
                    };
                },
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: 'User', schema: User_model_1.default },
                { name: 'Product', schema: Product_model_1.default },
                { name: 'ManagerProduct', schema: ManagerProduct_model_1.default },
                { name: 'Category', schema: Category_model_1.default },
                { name: 'Sale', schema: Sale_model_1.default },
                { name: 'SaleItem', schema: SaleItem_model_1.default },
                { name: 'FinanceTransaction', schema: FinanceTransaction_model_1.default },
                { name: 'Shipment', schema: Shipment_model_1.default },
                { name: 'Receipt', schema: Receipt_model_1.default },
                { name: 'StockTransfer', schema: StockTransfer_model_1.default },
            ]),
        ],
        providers: [database_service_1.DatabaseService],
        exports: [mongoose_1.MongooseModule, database_service_1.DatabaseService],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map