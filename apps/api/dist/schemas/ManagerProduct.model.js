"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ManagerProductSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true,
    },
    managerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    quantityReceived: { type: Number, required: true, min: 0 },
    quantityAvail: { type: Number, required: true, min: 0 },
}, {
    collection: 'manager_products',
    timestamps: true,
});
ManagerProductSchema.index({ productId: 1, managerId: 1 }, { unique: true });
exports.default = ManagerProductSchema;
//# sourceMappingURL=ManagerProduct.model.js.map