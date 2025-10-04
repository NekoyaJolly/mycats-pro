import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from "./auth/auth.module";
import { BreedingModule } from "./breeding/breeding.module";
import { BreedsModule } from "./breeds/breeds.module";
import { CareModule } from "./care/care.module";
import { CatsModule } from "./cats/cats.module";
import { CoatColorsModule } from "./coat-colors/coat-colors.module";
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { SecurityMiddleware } from "./common/middleware/security.middleware";
import { PedigreeModule } from "./pedigree/pedigree.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { TagsModule } from "./tags/tags.module";
import { UploadModule } from "./upload/upload.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        transport: process.env.NODE_ENV === 'production' ? undefined : {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: true },
        },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        formatters: {
          bindings: (b) => ({ pid: b.pid, host: b.hostname }),
          level: (l) => ({ level: l }),
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CatsModule,
    PedigreeModule,
    BreedsModule,
    CoatColorsModule,
    BreedingModule,
    CareModule,
    ScheduleModule,
    UploadModule,
    TagsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middleware globally in production
    const chain: Array<new (...args: any[]) => unknown> = [RequestIdMiddleware];
    if (process.env.NODE_ENV === 'production') {
      chain.push(SecurityMiddleware);
    }
    consumer.apply(...chain).forRoutes('*');
  }
}
