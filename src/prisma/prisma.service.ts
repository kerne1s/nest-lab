/**
 * @generated 2026-11-27 · DSH (deepseek-v4.1-flash) — сгенерировано, требуется ревью человеком.
 */
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Prisma отдаёт эти уровни событиями, а не печатает сама.
 * `as const` нужен, чтобы `typeof logOptions` сохранил литеральные 'event'/'query'
 * — от этого зависит тип `$on(...)` у PrismaClient.
 */
const logOptions = [
  { emit: 'event', level: 'query' },
  { emit: 'event', level: 'warn' },
  { emit: 'event', level: 'error' },
] as const satisfies Prisma.LogDefinition[];

/**
 * Без этого генерика базовый класс инстанцируется с `PrismaClientOptions`,
 * где `log` — просто LogLevel[], и `$on('query')` падает с
 * «Argument of type '"query"' is not assignable to parameter of type 'never'».
 */
type PrismaLogOptions = Prisma.PrismaClientOptions & { log: typeof logOptions };

/**
 * PrismaClient как обычный провайдер Nest.
 * Соединение ленивое: клиент подключается при первом запросе,
 * поэтому приложение стартует даже без поднятой БД (удобно для /health).
 *
 * Логирование запросов: SQL уходит в Nest Logger уровнем `debug`
 * (только вне production — в параметрах могут оказаться персональные данные).
 */
@Injectable()
export class PrismaService
  extends PrismaClient<PrismaLogOptions>
  implements OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ log: logOptions });

    if (process.env.NODE_ENV !== 'production') {
      this.$on('query', (e) => {
        this.logger.debug(
          `${e.query} -- params: ${e.params} -- ${e.duration} ms`,
        );
      });
    }
    this.$on('warn', (e) => this.logger.warn(e.message));
    this.$on('error', (e) => this.logger.error(e.message));
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
