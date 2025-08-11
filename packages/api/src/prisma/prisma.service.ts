import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        // This is a NestJS lifecycle hook.
        // Prisma's $connect method is called when the module is initialized.
        await this.$connect();
    }

    // Note: For graceful shutdowns (e.g., calling $disconnect), you would need
    // to enable shutdown hooks in your main.ts via `app.enableShutdownHooks()`.
    // For this application's scope, we'll rely on the default connection management.
}

