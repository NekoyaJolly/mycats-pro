import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";

import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
