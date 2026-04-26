"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StockTransferSchema = new mongoose_1.Schema({
    fromManagerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    toManagerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed'],
        default: 'pending',
    },
    initiatedAt: { type: Date, default: () => new Date() },
    confirmedAt: { type: Date, default: null },
}, {
    collection: 'stock_transfers',
    timestamps: { createdAt: true, updatedAt: false },
});
exports.default = StockTransferSchema;
//# sourceMappingURL=StockTransfer.model.js.map