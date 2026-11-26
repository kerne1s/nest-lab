import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { QueryVacanciesDto } from './dto/query-vacancies.dto';
import { VacanciesService } from './vacancies.service';

@ApiTags('vacancies')
@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacancies: VacanciesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать или обновить вакансию по url' })
  create(@Body() dto: CreateVacancyDto) {
    return this.vacancies.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Список с пагинацией, поиском и сортировкой' })
  findAll(@Query() query: QueryVacanciesDto) {
    return this.vacancies.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Одна вакансия по id' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vacancies.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить вакансию' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.vacancies.remove(id);
  }
}
