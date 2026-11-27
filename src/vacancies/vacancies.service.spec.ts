import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Юнит-тест без БД: Prisma подменяется объектом-заглушкой.
 * Первое упражнение недели 3 — дописать кейсы для findAll (фильтры, пагинация).
 */
describe('VacanciesService', () => {
  let service: VacanciesService;
  const prismaMock = {
    vacancy: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        VacanciesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(VacanciesService);
  });

  it('create вызывает upsert по url (идемпотентность)', async () => {
    prismaMock.vacancy.upsert.mockResolvedValue({ id: 'v1' });

    await service.create({
      title: 'Backend NestJS',
      company: 'Ronas IT',
      url: 'https://hh.ru/vacancy/1',
    });

    expect(prismaMock.vacancy.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { url: 'https://hh.ru/vacancy/1' } }),
    );
  });

  it('findOne бросает 404, если вакансии нет', async () => {
    prismaMock.vacancy.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findAll читает страницу и count в одном снапшоте (RepeatableRead)', async () => {
    prismaMock.$transaction.mockResolvedValue([[], 0]);

    await service.findAll({
      page: 2,
      limit: 10,
      sortBy: 'publishedAt',
      order: 'desc',
    });

    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Array), {
      isolationLevel: 'RepeatableRead',
    });
    // page=2, limit=10 -> skip=10: пагинация считается от номера страницы
    expect(prismaMock.vacancy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it('salaryFrom=0 не теряется (falsy-баг)', async () => {
    prismaMock.$transaction.mockResolvedValue([[], 0]);
    await service.findAll({ page: 1, limit: 10, salaryFrom: 0, sortBy: 'publishedAt', order: 'desc' });
    expect(prismaMock.vacancy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ salaryFrom: { gte: 0 } }) }),
    );
  });
});
