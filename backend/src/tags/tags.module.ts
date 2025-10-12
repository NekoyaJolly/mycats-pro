import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { TagCategoriesController } from "./tag-categories.controller";
import { TagCategoriesService } from "./tag-categories.service";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

@Module({
  imports: [PrismaModule],
  controllers: [TagsController, TagCategoriesController],
  providers: [TagsService, TagCategoriesService],
})
export class TagsModule {}
