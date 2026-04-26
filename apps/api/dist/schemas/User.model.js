"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    telegramId: {
        type: Number,
        unique: true,
        sparse: true,
        index: true,
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    password: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'manager', 'user'],
        default: 'user',
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'users',
});
exports.default = UserSchema;
//# sourceMappingURL=User.model.js.map