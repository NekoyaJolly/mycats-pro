import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { AssignTagDto, CreateTagDto, ReorderTagsDto, UpdateTagDto } from "./dto";
import { TagsService } from "./tags.service";

@ApiTags("Tags")
@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: "タグ一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiQuery({ name: "scope", required: false, description: "対象スコープ", type: [String] })
  @ApiQuery({
    name: "includeInactive",
    required: false,
    description: "非アクティブなタグを含めるか",
    type: Boolean,
  })
  findAll(
    @Query("scope") scope?: string | string[],
    @Query("includeInactive") includeInactive?: string,
  ) {
    const scopes = Array.isArray(scope) ? scope : scope ? [scope] : undefined;
    const includeInactiveFlag = includeInactive === "true";
    return this.tagsService.findAll({ scopes, includeInactive: includeInactiveFlag });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "タグの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("reorder")
  @ApiOperation({ summary: "タグの並び替え" })
  @ApiResponse({ status: HttpStatus.OK })
  reorder(@Body() dto: ReorderTagsDto) {
    return this.tagsService.reorder(dto.items);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiOperation({ summary: "タグの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @ApiOperation({ summary: "タグの削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  remove(@Param("id") id: string) {
    return this.tagsService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("/cats/:id/tags")
  @ApiOperation({ summary: "猫にタグを付与" })
  @ApiResponse({ status: HttpStatus.OK, description: "付与成功（重複時もOK）" })
  @ApiParam({ name: "id" })
  @HttpCode(HttpStatus.OK)
  assign(@Param("id") catId: string, @Body() dto: AssignTagDto) {
    return this.tagsService.assignToCat(catId, dto.tagId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("/cats/:id/tags/:tagId")
  @ApiOperation({ summary: "猫からタグを剥奪" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  @ApiParam({ name: "tagId" })
  unassign(@Param("id") catId: string, @Param("tagId") tagId: string) {
    return this.tagsService.unassignFromCat(catId, tagId);
  }
}
