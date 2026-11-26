# nest-lab — учебный backend (NestJS + PostgreSQL)

Полигон для перехода frontend → fullstack. Не «todo из туториала», а сервис вокруг
реальной задачи: сбор и поиск вакансий (родственно проекту `jobsearch`, где сейчас
лежат Python-скрипты).

Скелет уже собран и проверен: сборка проходит, юнит-тесты зелёные, `/api/health`
и Swagger отвечают. Дальше проект растёт по недельному плану — см. «План».

Задачи разбиты на пакеты в [`packets/`](packets/README.md): один пакет — одна ветка —
одно ревью. Начинать с `packets/01-api-filters.md`.

## Стек

| Слой | Выбор | Почему |
|---|---|---|
| Рантайм | Node.js 22+ | LTS, как на проде |
| Фреймворк | NestJS 11 | де-факто стандарт в аутсорсе; архитектурно близок к Spring Boot |
| Язык | TypeScript strict | без `any`, с декораторами |
| ORM | Prisma 6 | типы из схемы, явные миграции, меньше магии чем TypeORM |
| БД | PostgreSQL 17 (Docker) | главный навык, который отличает бэкендера |
| Документация | Swagger (`/docs`) | сразу видно, что API спроектирован |

TypeORM — вторая по популярности ORM на рынке РФ. Перейти на неё после Prisma
дешево, если SQL и миграции поняты; начинать с TypeORM сложнее (репозитории,
декораторы сущностей, миграции руками).

## Быстрый старт

```bash
cp .env.example .env
docker compose up -d          # Postgres на localhost:5433
npx prisma migrate dev --name init
npm run start:dev
```

- API: <http://localhost:3000/api/health>
- Swagger: <http://localhost:3000/docs>

Без БД приложение тоже стартует: `/api/health` отвечает `ok`, `/api/health/db` — `503`.
Это осознанно: liveness и readiness — разные проверки.

## Структура

```
src/
  main.ts                     bootstrap, ValidationPipe, Swagger, префикс /api
  app.module.ts               корневой модуль
  prisma/
    prisma.service.ts         PrismaClient как провайдер Nest (ленивое соединение)
    prisma.module.ts          @Global — Prisma доступна везде
  health/
    health.controller.ts      /health (liveness) и /health/db (readiness)
  vacancies/
    dto/create-vacancy.dto.ts валидация входа через class-validator
    dto/query-vacancies.dto.ts пагинация, поиск, сортировка
    vacancies.service.ts      бизнес-логика, upsert по url, $transaction
    vacancies.controller.ts   HTTP-слой, ParseUUIDPipe
    vacancies.service.spec.ts юнит-тест с моком Prisma (без БД)
prisma/schema.prisma          схема БД, источник типов
docker-compose.yml            Postgres 17 + healthcheck
```

Что уже показывает скелет как учебный материал:

- **DTO + `ValidationPipe`** — валидация на границе, а не в сервисе;
- **DI** — `PrismaService` внедряется конструктором, подменяется в тестах;
- **`upsert`** — идемпотентная запись, чтобы повторный сбор не падал на дублях;
- **`$transaction`** — `count` и страница списка консистентны;
- **liveness/readiness** — разные эндпоинты, разные вопросы;
- **`ParseUUIDPipe`** — id валидируется до попадания в сервис.

## План на 8 недель (~10–12 ч/нед)

Каждая неделя = теория + коммит в проект. Порядок важен: SQL раньше NestJS-фич,
инфраструктура позже, чтобы не тонуть в двух новых областях сразу.

### Неделя 1. HTTP и проектирование API
- Теория: методы и идемпотентность, коды ответов, пагинация (offset vs cursor),
  версионирование, идемпотентность `PUT` vs `POST`.
- Практика: прочитать `docs.nestjs.com` — Controllers, Providers, Modules.
  Сломать `QueryVacanciesDto` намеренно (limit=1000) и посмотреть, что вернёт API.
- Готово, если: можешь объяснить, почему `POST /vacancies` не должен быть
  идемпотентным, а `PUT` — должен.

### Неделя 2. PostgreSQL: запросы
- Теория: SELECT/JOIN/GROUP BY/HAVING, подзапросы, оконные функции, CTE, JSONB.
- Практика: `sql-ex.ru` — 30–40 задач; в проекте — `prisma studio` + ручные запросы
  через `psql` в контейнере.
- Задание: написать SQL-запрос «топ-5 компаний по числу вакансий с зарплатой выше X».

### Неделя 3. PostgreSQL: индексы, планы, транзакции
- Теория: B-tree/GIN, селективность, `EXPLAIN (ANALYZE, BUFFERS)`, MVCC,
  уровни изоляции, deadlock.
- Практика: залить 100k вакансий (генератор в `prisma/seed.ts`), сравнить
  `EXPLAIN ANALYZE` до и после индекса из `schema.prisma`.
- Задание: добить `vacancies.service.spec.ts` кейсами для `findAll`
  (фильтр по компании, поиск, пагинация).
- Готово, если: объясняешь, почему индекс по `lower(company)` не используется
  для `LIKE '%x%'`.

### Неделя 4. NestJS: слои и валидация
- Теория: pipes / guards / interceptors / exception filters, жизненный цикл запроса.
- Практика: добавить `CompaniesModule` (CRUD + связь с вакансиями),
  глобальный `HttpExceptionFilter` с единым форматом ошибки.
- Задание: эндпоинт `GET /vacancies/stats` — агрегат через `prisma.$queryRaw`.

### Неделя 5. Аутентификация
- Теория: JWT access/refresh, rotation, cookie `httpOnly` vs заголовок,
  хеширование (argon2), RBAC.
- Практика: `AuthModule` + `UsersModule`, `JwtAuthGuard`, роли `admin`/`user`,
  закрыть `POST/DELETE /vacancies` ролью admin.
- Готово, если: объясняешь, почему refresh-токен нельзя хранить в `localStorage`
  и зачем rotation.

### Неделя 6. Тесты
- Теория: пирамида тестов, e2e с реальной БД в контейнере.
- Практика: `test/vacancies.e2e-spec.ts` на `supertest` + отдельная тестовая БД
  (`DATABASE_URL` с суффиксом `_test`), подъём/очистка в `beforeAll`/`afterAll`.
- Задание: покрыть auth e2e-сценарием «логин → создание вакансии → 403 без токена».

### Неделя 7. Инфраструктура и эксплуатация
- Теория: Dockerfile (multi-stage), переменные окружения, graceful shutdown,
  логи (pino), health-check в оркестраторе.
- Практика: `Dockerfile` + сервис `api` в `docker-compose`, `app.enableShutdownHooks()`,
  структурные логи вместо `console.log`.
- Задание: деплой на VPS за Nginx (reverse proxy), проверка `curl` снаружи.

### Неделя 8. Кэш, очереди, производительность
- Теория: Redis (кэш, rate limit), BullMQ (фоновые задачи), N+1, индексы под запросы.
- Практика: кэш `GET /vacancies` в Redis с инвалидацией на запись; очередь
  «обновить вакансии» с воркером; `@nestjs/throttler` на auth-эндпоинты.
- Готово, если: на вопрос «почему список стал быстрее» отвечаешь цифрами
  (`EXPLAIN ANALYZE` до/после), а не «добавил кэш».

### Что дальше (недели 9–12)
Полнотекстовый поиск (`tsvector` + GIN, `to_tsquery`), интеграция со скриптами
`jobsearch` как источником данных, CI в GitLab (lint + test + build), метрики
(Prometheus/OpenTelemetry), GraphQL или gRPC как расширение кругозора.

## Бесплатные материалы

**NestJS**
- [Официальная документация](https://docs.nestjs.com/) — основной источник, читается
  последовательно: Overview → Fundamentals → Techniques.
- [Stepik: «NestJS: полный курс. Начальный уровень»](https://stepik.org/course/240769/promo) — бесплатно, по-русски.
- [Stepik: «NestJS — с нуля»](https://stepik.org/course/95448/promo) — платный, но недорогой; брать, только если документации мало.
- YouTube-плейлисты Ulbi TV и Владилена Минина — бесплатно, но проверяй версию
  NestJS в видео: на старых версиях часть API отличается.

**PostgreSQL и SQL**
- [Postgres Pro Education](https://edu.postgrespro.ru/) — бесплатные PDF и видео
  Егора Рогова. Базовый курс администрирования, затем «Изнутри».
- [Stepik: интерактивный тренажёр по SQL](https://stepik.org/course/63054/promo) — бесплатно, задачи с автопроверкой.
- [sql-ex.ru](https://sql-ex.ru/) — бесплатный тренажёр, обязателен.
- [Документация PostgreSQL](https://www.postgresql.org/docs/current/) — главы
  «Indexes», «Query Planning», «Concurrency Control» читать после базы.

**Node.js**
- [Документация Node.js](https://nodejs.org/docs/latest-v22.x/api/) — `stream`,
  `worker_threads`, `AsyncLocalStorage`, `events`.
- [Node.js Design Patterns, 3-е изд.](https://www.nodejsdesignpatterns.com/) — главы
  про streams, DI и масштабирование.

**Инфраструктура**
- [Docker: Get Started](https://docs.docker.com/get-started/) — бесплатно.
- [Nginx Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html).

## Чеклист «готов к fullstack-собесу»

- [ ] Объясняю разницу offset/cursor пагинации и когда что ломается
- [ ] Читаю `EXPLAIN ANALYZE` и понимаю, почему запрос медленный
- [ ] Знаю, зачем нужны транзакции и что такое уровень изоляции
- [ ] Пишу e2e-тест на NestJS с реальной БД
- [ ] Объясняю жизненный цикл запроса в Nest (middleware → guard → pipe → handler → interceptor → filter)
- [ ] Понимаю JWT access/refresh и почему refresh в `httpOnly` cookie
- [ ] Поднимаю сервис в Docker и деплою на VPS
- [ ] Могу рассказать про свой проект цифрами: сколько запросов, сколько мс, что оптимизировал
