import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { CoatColorsController } from "./coat-colors.controller";
import { CoatColorsService } from "./coat-colors.service";

@Module({
  imports: [PrismaModule],
  controllers: [CoatColorsController],
  providers: [CoatColorsService],
  exports: [CoatColorsService],
})
export class CoatColorsModule {}
