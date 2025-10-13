import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { TagAutomationService } from "./tag-automation.service";
import { TagCategoriesController } from "./tag-categories.controller";
import { TagCategoriesService } from "./tag-categories.service";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

@Module({
  imports: [PrismaModule],
  controllers: [TagsController, TagCategoriesController],
  providers: [TagsService, TagCategoriesService, TagAutomationService],
  exports: [TagsService, TagCategoriesService, TagAutomationService],
})
export class TagsModule {}
