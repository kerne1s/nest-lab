# Пакет 06 · Аутентификация и авторизация

**Цель:** закрыть API так, как это делают в проде: короткоживущий access-токен,
refresh с ротацией, пароли в argon2, роли через guard.

**Ветка:** `packet/06-auth` · **Время:** 8–10 ч

## Теория (3 ч)

- JWT: подпись, `exp`, `sub`, почему токен нельзя отозвать без хранилища.
- Access (15 мин) + refresh (30 дней) с ротацией и хранением хеша refresh-токена в БД.
- `httpOnly` + `Secure` + `SameSite` cookie vs заголовок `Authorization`.
- OWASP: перебор паролей, user enumeration, timing-атаки.

## Задачи

- [ ] 1. **`UsersModule`**: `email @unique`, `passwordHash`, `role` (`user`/`admin`), argon2 для хеша.
- [ ] 2. **`POST /auth/register`, `POST /auth/login`** → access + refresh (refresh в `httpOnly` cookie).
- [ ] 3. **`POST /auth/refresh`** с ротацией: старый refresh инвалидируется, повторное использование → 401 и разлогин всей сессии.
- [ ] 4. **`JwtAuthGuard`** + `@Public()` декоратор (по умолчанию всё закрыто — fail-safe).
- [ ] 5. **`RolesGuard`** + `@Roles('admin')`: `POST/DELETE /vacancies` только admin.
- [ ] 6. **Rate limit** на `/auth/*`: `@nestjs/throttler`, 5 попыток/мин на IP.

## Критерии приёмки

- [ ] Пароль нигде не логируется и не возвращается в ответе
- [ ] На неверный email и неверный пароль — одинаковый ответ и одинаковое время
- [ ] Refresh-токен в БД хранится хешем, а не открытым текстом
- [ ] e2e: логин → создание вакансии → 403 без токена → 403 с ролью `user`

## Вопросы, на которые умеешь отвечать

- Почему access-токен делают коротким, а не «на год»?
- Что произойдёт, если украдут refresh-токен, и как ротация это ограничивает?
- Почему `localStorage` — плохое место для токена и чем `httpOnly` cookie лучше?
