import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVacancyDto {
  @ApiProperty({ example: 'Backend-разработчик (NestJS)' })
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiProperty({ example: 'Ronas IT' })
  @IsString()
  @Length(1, 120)
  company!: string;

  @ApiProperty({ example: 'https://hh.ru/vacancy/123' })
  @IsUrl({ require_protocol: true })
  url!: string;

  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryFrom?: number;

  @ApiPropertyOptional({ example: 250000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryTo?: number;

  @ApiPropertyOptional({ example: 'RUB', default: 'RUB' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-11-20T10:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  publishedAt?: string;
}
