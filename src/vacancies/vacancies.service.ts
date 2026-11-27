import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Vacancy } from '@prisma/client';
import { isBoolean } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { QueryVacanciesDto } from './dto/query-vacancies.dto';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class VacanciesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * create — идемпотентная вставка по url.
   * upsert вместо create: повторный сбор вакансий не падает на дублях.
   */
  create(dto: CreateVacancyDto): Promise<Vacancy> {
    const data = {
      ...dto,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    };
    return this.prisma.vacancy.upsert({
      where: { url: dto.url },
      create: data,
      update: data,
    });
  }

  async findAll(query: QueryVacanciesDto): Promise<Paginated<Vacancy>> {
    const { page, limit, search, company, salaryFrom, remote, sortBy, order } = query;

    const where: Prisma.VacancyWhereInput = {
      ...(company ? { company: { equals: company, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(salaryFrom ? { salaryFrom: { gte: salaryFrom } } : {}),
      ...(isBoolean(remote) ? { remote: { equals: remote } } : {}),
    };

    // Два запроса в одной транзакции — но самой транзакции мало.
    // PostgreSQL по умолчанию на READ COMMITTED: каждый запрос внутри неё
    // берёт СВЕЖИЙ снапшот, поэтому count и страница всё равно могут
    // разъехаться, если между ними кто-то вставил строку.
    // RepeatableRead фиксирует один снапшот на всю транзакцию — только тогда
    // total и items согласованы между собой.
    const [items, total] = await this.prisma.$transaction(
      [
        this.prisma.vacancy.findMany({
          where,
          orderBy: { [sortBy]: { sort: order, nulls: 'last' } },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.vacancy.count({ where }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Vacancy> {
    const vacancy = await this.prisma.vacancy.findUnique({ where: { id } });
    if (!vacancy) {
      throw new NotFoundException(`Вакансия ${id} не найдена`);
    }
    return vacancy;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.vacancy.delete({ where: { id } });
  }
}
