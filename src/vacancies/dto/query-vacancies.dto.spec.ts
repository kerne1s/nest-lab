import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { QueryVacanciesDto } from './query-vacancies.dto';

/**
 * Тесты DTO — самый дешёвый уровень проверки: ни Nest-контейнера, ни БД, ни HTTP.
 *
 * `plainToInstance` + `validate` делают ровно то же, что ValidationPipe в main.ts:
 * сначала transform (срабатывают @Type и @TransformBoolean), потом валидация.
 * Упавший тест здесь = 400 на реальном запросе.
 */
async function transform(raw: Record<string, unknown>) {
  const dto = plainToInstance(QueryVacanciesDto, raw);
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  return { dto, errors };
}

function failedProperties(errors: ValidationError[]): string[] {
  return errors.map((error) => error.property).sort();
}

describe('QueryVacanciesDto', () => {
  describe('значения по умолчанию', () => {
    it('подставляет page=1, limit=20, sortBy=publishedAt, order=desc', async () => {
      const { dto, errors } = await transform({});

      expect(errors).toHaveLength(0);
      expect(dto).toMatchObject({
        page: 1,
        limit: 20,
        sortBy: 'publishedAt',
        order: 'desc',
      });
      expect(dto.salaryFrom).toBeUndefined();
      expect(dto.remote).toBeUndefined();
    });
  });

  describe('remote: строка из query-параметра → boolean', () => {
    it('"false" превращается в false, а не в true', async () => {
      const { dto, errors } = await transform({ remote: 'false' });

      expect(errors).toHaveLength(0);
      expect(dto.remote).toBe(false);
    });

    it('"true" превращается в true', async () => {
      const { dto, errors } = await transform({ remote: 'true' });

      expect(errors).toHaveLength(0);
      expect(dto.remote).toBe(true);
    });

    it('настоящий boolean из тела запроса не портится', async () => {
      const { dto, errors } = await transform({ remote: false });

      expect(errors).toHaveLength(0);
      expect(dto.remote).toBe(false);
    });

    it('мусорное значение отклоняется, а не приводится к false', async () => {
      const { errors } = await transform({ remote: 'yes' });

      expect(failedProperties(errors)).toEqual(['remote']);
    });
  });

  describe('salaryFrom: строка → число', () => {
    it('"200000" превращается в число', async () => {
      const { dto, errors } = await transform({ salaryFrom: '200000' });

      expect(errors).toHaveLength(0);
      expect(dto.salaryFrom).toBe(200000);
    });

    it('0 — валидное значение, а не "пусто"', async () => {
      const { dto, errors } = await transform({ salaryFrom: '0' });

      expect(errors).toHaveLength(0);
      expect(dto.salaryFrom).toBe(0);
    });

    it('отрицательное значение отклоняется (@Min(0))', async () => {
      const { errors } = await transform({ salaryFrom: '-1' });

      expect(failedProperties(errors)).toEqual(['salaryFrom']);
    });

    it('нечисловая строка отклоняется (@IsInt)', async () => {
      const { errors } = await transform({ salaryFrom: 'abc' });

      expect(failedProperties(errors)).toEqual(['salaryFrom']);
    });
  });

  describe('границы и перечисления', () => {
    it('limit=100 проходит (верхняя граница @Max(100))', async () => {
      const { dto, errors } = await transform({ limit: '100' });

      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(100);
    });

    it('limit=1000 отклоняется (@Max(100))', async () => {
      const { errors } = await transform({ limit: '1000' });

      expect(failedProperties(errors)).toEqual(['limit']);
    });

    it('sortBy вне списка отклоняется (@IsIn)', async () => {
      const { errors } = await transform({ sortBy: 'url' });

      expect(failedProperties(errors)).toEqual(['sortBy']);
    });

    it('неизвестный параметр отклоняется (forbidNonWhitelisted)', async () => {
      const { errors } = await transform({ foo: 'bar' });

      expect(failedProperties(errors)).toEqual(['foo']);
    });
  });

  describe('паритет с реальным ValidationPipe из main.ts', () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    it('пропускает корректный query и трансформирует типы', async () => {
      await expect(
        pipe.transform(
          { remote: 'false', salaryFrom: '0', limit: '50' },
          { type: 'query', metatype: QueryVacanciesDto },
        ),
      ).resolves.toMatchObject({ remote: false, salaryFrom: 0, limit: 50 });
    });

    it('отвечает BadRequestException на невалидный query (это и есть 400)', async () => {
      await expect(
        pipe.transform(
          { limit: '1000' },
          { type: 'query', metatype: QueryVacanciesDto },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
