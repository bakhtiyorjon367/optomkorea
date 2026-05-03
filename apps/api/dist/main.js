"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
    const configService = app.get(config_1.ConfigService);
    const clientUrl = configService.get('CLIENT_URL') ?? 'http://localhost:5173';
    const port = Number(configService.get('PORT') ?? 4000);
    const allowedOrigins = [clientUrl, 'http://localhost:5173'];
    app.enableCors({
        origin: Array.from(new Set(allowedOrigins)),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map