import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    // Use composition instead of inheritance to avoid type resolution issues.
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async onModuleInit() {
        await this.prisma.$connect();
    }

    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }

    // Delegate property access to the underlying client.
    // This is a workaround to avoid refactoring all services that use this service.
    get user() {
        return this.prisma.user;
    }

    get anime() {
        return this.prisma.anime;
    }

    get userAnime() {
        return this.prisma.userAnime;
    }
}
