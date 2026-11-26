import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient как обычный провайдер Nest.
 * Соединение ленивое: клиент подключается при первом запросе,
 * поэтому приложение стартует даже без поднятой БД (удобно для /health).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
