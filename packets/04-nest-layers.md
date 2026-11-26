# Пакет 04 · Слои NestJS

**Цель:** понять жизненный цикл запроса и научиться раскладывать код по слоям так,
чтобы контроллер не знал про БД, а сервис — про HTTP.

**Ветка:** `packet/04-layers` · **Время:** 8–10 ч

## Теория (3 ч)

- Request lifecycle: middleware → guards → interceptors (before) → pipes → handler →
  interceptors (after) → exception filters.
- `@Injectable({ scope })`: singleton vs request-scoped — и почему request-scoped дорог.
- `ExceptionFilter`, `Interceptor`, `Guard` — что в каждом уместно.

## Задачи

- [ ] 1. **`CompaniesModule`**: сущность `Company` (`id`, `name @unique`, `site`), связь `Vacancy.companyId` вместо строки `company` (миграция + перенос данных).
- [ ] 2. **Глобальный `HttpExceptionFilter`**: единый формат `{ statusCode, message, path, timestamp }`, логирование 5xx.
- [ ] 3. **`LoggingInterceptor`**: метод, путь, длительность, статус.
- [ ] 4. **`@CurrentUser()`** — параметрический декоратор (пригодится в пакете 06).
- [ ] 5. Убрать из контроллера любую бизнес-логику: только DTO → сервис.

## Критерии приёмки

- [ ] Контроллер не импортирует `PrismaService`
- [ ] Ошибки валидации и 404 выглядят одинаково по структуре
- [ ] В логах есть длительность каждого запроса
- [ ] Миграция с переносом данных, а не «удалить и создать заново»

## Вопросы, на которые умеешь отвечать

- Чем `interceptor` отличается от `middleware` и почему в Nest два механизма?
- Почему request-scoped провайдер бьёт по производительности?
- Где валидировать права: в guard, в сервисе или в обоих?
