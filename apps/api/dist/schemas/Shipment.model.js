"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ShipmentSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true,
    },
    quantityTotal: { type: Number, required: true, min: 1 },
    quantityDistributed: { type: Number, default: 0, min: 0 },
    costKrwTotal: { type: Number, default: 0 },
    shippedAt: { type: Date, default: () => new Date() },
    notes: { type: String, default: '' },
}, { collection: 'shipments', timestamps: true });
exports.default = ShipmentSchema;
//# sourceMappingURL=Shipment.model.js.map