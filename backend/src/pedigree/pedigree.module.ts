import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { PedigreeController } from "./pedigree.controller";
import { PedigreeService } from "./pedigree.service";

@Module({
  imports: [PrismaModule],
  controllers: [PedigreeController],
  providers: [PedigreeService],
  exports: [PedigreeService],
})
export class PedigreeModule {}
