"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCT_UPLOAD_PUBLIC_PREFIX = void 0;
exports.getProductsUploadAbsoluteDir = getProductsUploadAbsoluteDir;
exports.thumbPublicPathFromFull = thumbPublicPathFromFull;
const path_1 = require("path");
exports.PRODUCT_UPLOAD_PUBLIC_PREFIX = '/uploads/products';
function getProductsUploadAbsoluteDir() {
    return (0, path_1.join)(process.cwd(), 'uploads', 'products');
}
function thumbPublicPathFromFull(fullPublicPath) {
    if (!fullPublicPath.includes(`${exports.PRODUCT_UPLOAD_PUBLIC_PREFIX}/`) || fullPublicPath.includes('_thumb.')) {
        return fullPublicPath;
    }
    return fullPublicPath.replace(/(\.[a-z0-9]+)(\?.*)?$/i, '_thumb$1$2');
}
//# sourceMappingURL=product-upload.paths.js.map