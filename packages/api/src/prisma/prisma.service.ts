import { Injectable, OnModuleInit } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// Using require to bypass static analysis issues with generated client
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit() {
    // This is a NestJS lifecycle hook.
    // Prisma's $connect method is called when the module is initialized.
    await this.$connect();
  }

  // Note: For graceful shutdowns (e.g., calling $disconnect), you would need
  // to enable shutdown hooks in your main.ts via `app.enableShutdownHooks()`.
  // For this application's scope, we'll rely on the default connection management.
}
