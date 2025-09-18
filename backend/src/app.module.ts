import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "./auth/auth.module";
import { BreedingModule } from "./breeding/breeding.module";
import { BreedsModule } from "./breeds/breeds.module";
import { CareModule } from "./care/care.module";
import { CatsModule } from "./cats/cats.module";
import { CoatColorsModule } from "./coat-colors/coat-colors.module";
import { SecurityMiddleware } from "./common/middleware/security.middleware";
import { PedigreeModule } from "./pedigree/pedigree.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { TagsModule } from "./tags/tags.module";
import { UploadModule } from "./upload/upload.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
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
    if (process.env.NODE_ENV === 'production') {
      consumer.apply(SecurityMiddleware).forRoutes('*');
    }
  }
}
