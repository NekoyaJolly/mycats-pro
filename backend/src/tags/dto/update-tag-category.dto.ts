import { PartialType } from "@nestjs/swagger";

import { CreateTagCategoryDto } from "./create-tag-category.dto";

export class UpdateTagCategoryDto extends PartialType(CreateTagCategoryDto) {}
