# Пакет 02 · SQL снаружи и внутри

**Цель:** перестать бояться SQL и научиться писать запросы, которые ORM не выражает —
агрегаты, оконные функции, `GROUP BY`.

**Ветка:** `packet/02-sql` · **Время:** 6–8 ч

## Теория (3 ч)

- JOIN (INNER/LEFT), `GROUP BY` + `HAVING`, подзапросы, CTE (`WITH`).
- Оконные функции: `ROW_NUMBER()`, `RANK()`, `SUM() OVER (PARTITION BY ...)`.
- [sql-ex.ru](https://sql-ex.ru/) — 30–40 задач, обязательно руками.

## Задачи

- [ ] 1. Подключиться к БД через `psql` в контейнере: `docker exec -it nest-lab-db psql -U lab -d nest_lab`. Написать 5 запросов: топ компаний по числу вакансий, медиана зарплат, вакансии без зарплаты, дубликаты по `company+title`, доля remote.
- [ ] 2. **`GET /api/vacancies/stats`** — агрегат через `prisma.$queryRaw`: `{ total, remoteShare, byCompany: [{ company, count, avgSalaryFrom }] }`. Типизировать результат (`$queryRaw<Row[]>`, не `any`).
- [ ] 3. **`GET /api/vacancies/:id/similar`** — 3 вакансии той же компании с близкой зарплатой (`ABS(salary_from - $1) < 30000`), одним запросом.
- [ ] 4. Разобрать, во что Prisma превращает `findMany` с `include`: включить `DEBUG=prisma:query` и посмотреть SQL.

## Критерии приёмки

- [ ] `/stats` не делает N+1: один запрос, а не запрос на каждую компанию
- [ ] `$queryRaw` типизирован, `any` отсутствует
- [ ] Умеешь объяснить, чем `WHERE` отличается от `HAVING`

## Вопросы, на которые умеешь отвечать

- Почему `LEFT JOIN` + условие в `WHERE` превращается в `INNER JOIN` и как этого избежать?
- Что делает `ROW_NUMBER() OVER (PARTITION BY company ORDER BY salary_from DESC)`?
- Чем `$queryRaw` опасен и как параметризовать значения?
