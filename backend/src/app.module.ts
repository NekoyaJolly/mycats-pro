import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CatsModule } from './cats/cats.module';
import { PedigreeModule } from './pedigree/pedigree.module';
import { BreedsModule } from './breeds/breeds.module';
import { CoatColorsModule } from './coat-colors/coat-colors.module';
import { BreedingModule } from './breeding/breeding.module';
import { CareModule } from './care/care.module';
import { ScheduleModule } from './schedule/schedule.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
