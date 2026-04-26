"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shapeIntoMongoObjectId = void 0;
const mongoose_1 = require("mongoose");
const shapeIntoMongoObjectId = (target) => {
    if (typeof target === 'string') {
        return new mongoose_1.Types.ObjectId(target);
    }
    if (target instanceof mongoose_1.Types.ObjectId) {
        return target;
    }
    return target;
};
exports.shapeIntoMongoObjectId = shapeIntoMongoObjectId;
//# sourceMappingURL=config.js.map