"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SaleItemSchema = new mongoose_1.Schema({
    saleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Sale',
        required: true,
        index: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
}, {
    collection: 'sale_items',
    timestamps: { createdAt: true, updatedAt: false },
});
exports.default = SaleItemSchema;
//# sourceMappingURL=SaleItem.model.js.map