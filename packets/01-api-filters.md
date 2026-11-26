# Пакет 01 · API-дизайн и фильтры

**Цель:** научиться проектировать вход API так, чтобы невалидные данные не доходили
до базы, и понимать, что такое идемпотентность и корректные коды ответов.

**Ветка:** `packet/01-filters` · **Время:** 6–8 ч

## Теория (2–3 ч)

- [docs.nestjs.com](https://docs.nestjs.com/) → Overview: Controllers, Providers, Modules.
- Pipes: `ValidationPipe`, `ParseUUIDPipe`, `ParseIntPipe` — где что уместно.
- Коды ответов: 200/201/204, 400 vs 422, 404, 409 (конфликт уникальности), 429.
- Идемпотентность: почему `PUT` идемпотентен, а `POST` — нет.

## Задачи

- [ ] 1. **Фильтр `salaryFrom`** в `QueryVacanciesDto`: `@IsOptional() @Type(() => Number) @IsInt() @Min(0)`, провести в `where` сервиса как `salaryFrom: { gte: ... }`.
- [ ] 2. **Фильтр `remote`** (`@IsOptional() @IsBoolean()` + `@Transform` из строки `"true"/"false"` — query-параметры всегда строки).
- [ ] 3. **Сортировка по зарплате**: `sortBy=salaryFrom` не должен падать, если у части вакансий `salaryFrom = null`. Решить, куда их класть (`nulls: 'last'`).
- [ ] 4. **`POST /vacancies` возвращает 201**, `DELETE` — 204, повторный `DELETE` — 404. Проверить через `/docs`.
- [ ] 5. **Тест**: «при `salaryFrom=200000` в `findMany` уходит `where.salaryFrom.gte = 200000`».

## Критерии приёмки

- [ ] `GET /api/vacancies?salaryFrom=abc` → 400 с понятным сообщением, а не 500
- [ ] `GET /api/vacancies?limit=1000` → 400 (max 100)
- [ ] `GET /api/vacancies?foo=bar` → 400 (запрет лишних полей включён)
- [ ] Тест на фильтр зелёный, `npm run build` без ошибок

## Вопросы, на которые умеешь отвечать

- Чем `400` отличается от `422` и какой код вернуть на невалидный UUID?
- Почему валидация в `DTO`, а не проверки `if` в сервисе?
- Почему `POST` с `upsert` внутри — это уже не совсем `POST` по смыслу?
