import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Небольшой детерминированный набор для ручной проверки сортировки по зарплате
 * (пакет 01, задача 3): часть вакансий намеренно без salaryFrom.
 *
 * Ожидаемый порядок при sortBy=salaryFrom:
 *   asc  -> 60000, 80000, 150000, 200000, 250000, 300000, 400000, 450000, затем NULL
 *   desc -> 450000, 400000, 300000, 250000, 200000, 150000, 80000, 60000, затем NULL
 *
 * Источник `seed` позволяет пересоздавать набор, не трогая вакансии,
 * добавленные через API. Большой генератор на 100k появится в пакете 03.
 */
const vacancies: Prisma.VacancyCreateManyInput[] = [
  {
    title: 'Senior Node.js разработчик',
    company: 'Тинькофф',
    url: 'https://hh.ru/vacancy/nest-lab-seed-001',
    source: 'seed',
    salaryFrom: 450000,
    salaryTo: 600000,
    remote: true,
    publishedAt: new Date('2026-11-20T10:00:00.000Z'),
  },
  {
    title: 'Lead Backend-разработчик',
    company: 'Яндекс',
    url: 'https://hh.ru/vacancy/nest-lab-seed-002',
    source: 'seed',
    salaryFrom: 400000,
    salaryTo: 550000,
    remote: false,
    publishedAt: new Date('2026-11-19T10:00:00.000Z'),
  },
  {
    title: 'Backend-разработчик (NestJS)',
    company: 'Ronas IT',
    url: 'https://hh.ru/vacancy/nest-lab-seed-003',
    source: 'seed',
    salaryFrom: 300000,
    salaryTo: 400000,
    remote: true,
    publishedAt: new Date('2026-11-18T10:00:00.000Z'),
  },
  {
    title: 'Fullstack TypeScript разработчик',
    company: 'Ozon Tech',
    url: 'https://hh.ru/vacancy/nest-lab-seed-004',
    source: 'seed',
    salaryFrom: 250000,
    salaryTo: 350000,
    remote: true,
    publishedAt: new Date('2026-11-17T10:00:00.000Z'),
  },
  {
    title: 'Frontend-разработчик (React)',
    company: 'Ronas IT',
    url: 'https://hh.ru/vacancy/nest-lab-seed-005',
    source: 'seed',
    salaryFrom: 200000,
    salaryTo: null,
    remote: true,
    publishedAt: new Date('2026-11-16T10:00:00.000Z'),
  },
  {
    title: 'Middle Angular разработчик',
    company: 'Лаборатория Касперского',
    url: 'https://hh.ru/vacancy/nest-lab-seed-006',
    source: 'seed',
    salaryFrom: 150000,
    salaryTo: 220000,
    remote: false,
    publishedAt: new Date('2026-11-15T10:00:00.000Z'),
  },
  {
    title: 'Junior Backend-разработчик',
    company: 'Сбер',
    url: 'https://hh.ru/vacancy/nest-lab-seed-007',
    source: 'seed',
    salaryFrom: 80000,
    salaryTo: 120000,
    remote: false,
    publishedAt: new Date('2026-11-14T10:00:00.000Z'),
  },
  {
    title: 'Junior Frontend-разработчик',
    company: 'VK',
    url: 'https://hh.ru/vacancy/nest-lab-seed-008',
    source: 'seed',
    salaryFrom: 60000,
    salaryTo: 90000,
    remote: true,
    publishedAt: new Date('2026-11-13T10:00:00.000Z'),
  },
  {
    title: 'QA Automation Engineer',
    company: 'Ланит',
    url: 'https://hh.ru/vacancy/nest-lab-seed-009',
    source: 'seed',
    salaryFrom: null,
    salaryTo: null,
    remote: true,
    publishedAt: new Date('2026-11-12T10:00:00.000Z'),
  },
  {
    title: 'Product Analyst',
    company: 'Авито',
    url: 'https://hh.ru/vacancy/nest-lab-seed-010',
    source: 'seed',
    salaryFrom: null,
    salaryTo: null,
    remote: false,
    publishedAt: new Date('2026-11-11T10:00:00.000Z'),
  },
  {
    title: 'DevOps Engineer',
    company: 'Селектел',
    url: 'https://hh.ru/vacancy/nest-lab-seed-011',
    source: 'seed',
    salaryFrom: null,
    salaryTo: null,
    remote: true,
    publishedAt: new Date('2026-11-10T10:00:00.000Z'),
  },
  {
    title: 'Support Engineer',
    company: 'Контур',
    url: 'https://hh.ru/vacancy/nest-lab-seed-012',
    source: 'seed',
    salaryFrom: null,
    salaryTo: null,
    remote: false,
    publishedAt: new Date('2026-11-09T10:00:00.000Z'),
  },
];

async function main(): Promise<void> {
  // Пересоздаём только строки сида: данные, добавленные через API, не затрагиваем.
  await prisma.vacancy.deleteMany({ where: { source: 'seed' } });
  await prisma.vacancy.createMany({ data: vacancies });

  const seeded = await prisma.vacancy.count({ where: { source: 'seed' } });
  const total = await prisma.vacancy.count();
  console.log(`seed: ${seeded} вакансий с source=seed, всего в базе ${total}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
