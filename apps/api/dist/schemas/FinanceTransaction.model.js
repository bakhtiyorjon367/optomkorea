"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FinanceTransactionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: ['admin_gave', 'manager_paid'],
    },
    managerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    transactionDate: { type: Date, default: () => new Date() },
    recordedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    collection: 'finance_transactions',
    timestamps: { createdAt: true, updatedAt: false },
});
exports.default = FinanceTransactionSchema;
//# sourceMappingURL=FinanceTransaction.model.js.map