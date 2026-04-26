"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SaleSchema = new mongoose_1.Schema({
    type: { type: String, required: true, enum: ['cash', 'credit'] },
    managerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    buyerName: { type: String, default: '' },
    comment: { type: String, default: '' },
    status: {
        type: String,
        required: true,
        enum: ['paid', 'unpaid'],
        default: 'paid',
    },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0, min: 0 },
}, {
    collection: 'sales',
    timestamps: { createdAt: true, updatedAt: false },
});
exports.default = SaleSchema;
//# sourceMappingURL=Sale.model.js.map