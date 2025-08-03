import { Module } from '@nestjs/common';
import { CoatColorsService } from './coat-colors.service';
import { CoatColorsController } from './coat-colors.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoatColorsController],
  providers: [CoatColorsService],
  exports: [CoatColorsService],
})
export class CoatColorsModule {}
