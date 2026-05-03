import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService implements OnModuleInit {
    private readonly config;
    private ready;
    constructor(config: ConfigService);
    onModuleInit(): void;
    isConfigured(): boolean;
    uploadProductWebp(webp: Buffer, publicId: string): Promise<string>;
}
