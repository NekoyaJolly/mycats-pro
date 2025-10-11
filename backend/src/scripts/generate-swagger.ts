import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from '../app.module';

async function generateSwagger(): Promise<void> {
  const logger = new Logger('SwaggerGenerator');
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Cat Management System API')
    .setDescription('API for managing cat breeding and care records')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = join(process.cwd(), 'openapi.json');

  const directory = dirname(outputPath);
  await mkdir(directory, { recursive: true });
  await writeFile(outputPath, JSON.stringify(document, null, 2), 'utf8');

  logger.log(`✅ Swagger schema exported to ${outputPath}`);

  await app.close();
}

generateSwagger().catch((error) => {
  const logger = new Logger('SwaggerGenerator');
  logger.error('Failed to generate Swagger schema', error);
  process.exitCode = 1;
});
