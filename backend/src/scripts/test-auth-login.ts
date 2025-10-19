import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';

async function main() {
  const logger = new Logger('ManualLoginScript');
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const authService = appContext.get(AuthService);
    const result = await authService.login('admin@example.com', 'Passw0rd!');
    logger.log(`Login success: ${JSON.stringify(result)}`);
  } catch (error) {
    logger.error('Login failed', error instanceof Error ? error.stack : error);
  } finally {
    await appContext.close();
  }
}

main().catch((error) => {
   
  console.error('Unexpected error', error);
  process.exit(1);
});
