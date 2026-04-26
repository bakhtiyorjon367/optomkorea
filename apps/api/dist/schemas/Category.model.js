"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'categories',
});
exports.default = CategorySchema;
//# sourceMappingURL=Category.model.js.map