import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { BreedingController } from "./breeding.controller";
import { BreedingService } from "./breeding.service";

@Module({
  imports: [PrismaModule],
  controllers: [BreedingController],
  providers: [BreedingService],
})
export class BreedingModule {}
