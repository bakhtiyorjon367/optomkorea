"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const PRODUCT_FOLDER = 'koruz/products';
let CloudinaryService = class CloudinaryService {
    config;
    ready = false;
    constructor(config) {
        this.config = config;
    }
    onModuleInit() {
        const name = this.config.get('CLOUDINARY_CLOUD_NAME');
        const key = this.config.get('CLOUDINARY_API_KEY');
        const secret = this.config.get('CLOUDINARY_API_SECRET');
        if (name && key && secret) {
            cloudinary_1.v2.config({ cloud_name: name, api_key: key, api_secret: secret, secure: true });
        }
        else {
            cloudinary_1.v2.config();
        }
        const c = cloudinary_1.v2.config();
        this.ready = Boolean(c?.cloud_name && c?.api_key && c?.api_secret);
    }
    isConfigured() {
        return this.ready;
    }
    async uploadProductWebp(webp, publicId) {
        if (!this.ready) {
            throw new Error('Cloudinary is not configured');
        }
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({
                folder: PRODUCT_FOLDER,
                public_id: publicId,
                resource_type: 'image',
                format: 'webp',
                overwrite: true,
            }, (err, result) => {
                if (err)
                    reject(err);
                else if (!result?.secure_url)
                    reject(new Error('Cloudinary: missing secure_url'));
                else
                    resolve(result.secure_url);
            });
            stream.end(webp);
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map