"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    costKrw: { type: Number, default: 0 },
    sellingPrice: { type: Number, required: true },
    totalAvail: { type: Number, default: 0, min: 0 },
    totalShipped: { type: Number, default: 0, min: 0 },
    totalReceived: { type: Number, default: 0, min: 0 },
    shippedCount: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { collection: 'products', timestamps: true });
exports.default = ProductSchema;
//# sourceMappingURL=Product.model.js.map