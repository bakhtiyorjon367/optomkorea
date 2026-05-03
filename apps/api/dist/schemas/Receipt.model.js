"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReceiptSchema = new mongoose_1.Schema({
    shipmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Shipment',
        required: true,
        index: true,
    },
    managerId: {
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
    receivedAt: { type: Date, default: () => new Date() },
}, {
    collection: 'receipts',
    timestamps: { createdAt: true, updatedAt: false },
});
ReceiptSchema.index({ shipmentId: 1, managerId: 1 }, { unique: true });
exports.default = ReceiptSchema;
//# sourceMappingURL=Receipt.model.js.map