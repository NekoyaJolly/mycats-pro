import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { TagAutomationService } from "./tag-automation.service";
import { TagCategoriesController } from "./tag-categories.controller";
import { TagCategoriesService } from "./tag-categories.service";
import { TagGroupsController } from "./tag-groups.controller";
import { TagGroupsService } from "./tag-groups.service";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

@Module({
  imports: [PrismaModule],
  controllers: [TagsController, TagCategoriesController, TagGroupsController],
  providers: [TagsService, TagCategoriesService, TagGroupsService, TagAutomationService],
  exports: [TagsService, TagCategoriesService, TagGroupsService, TagAutomationService],
})
export class TagsModule {}
