import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { BreedsController } from "./breeds.controller";
import { BreedsService } from "./breeds.service";

@Module({
  imports: [PrismaModule],
  controllers: [BreedsController],
  providers: [BreedsService],
  exports: [BreedsService],
})
export class BreedsModule {}
