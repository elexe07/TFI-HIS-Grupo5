import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './building-blocks/api/domain-error.filter';
import type { Env } from './config/env';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new DomainErrorFilter());

  const swagger = new DocumentBuilder()
    .setTitle('HIS API')
    .setDescription('Hospital Information System — Programación 4')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger), {
    jsonDocumentUrl: 'docs/openapi.json',
  });

  const port = app.get(ConfigService<Env, true>).get('PORT', { infer: true });
  await app.listen(port);

  Logger.log(`API en http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`Swagger en http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();
