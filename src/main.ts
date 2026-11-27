import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Глобальная валидация DTO: неизвестные поля отбрасываются, типы приводятся.
  // Без этого class-validator в контроллерах не работает.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Nest Lab API')
    .setDescription('Учебный API: вакансии, поиск, фильтры')
    .setVersion('0.1')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API:  http://localhost:${port}/api/health`);
  console.log(`Docs: http://localhost:${port}/docs`);
}

void bootstrap();
