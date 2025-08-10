import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TagsService } from "./tags.service";
import { AssignTagDto, CreateTagDto } from "./dto";

@ApiTags("Tags")
@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: "タグ一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findAll() {
    return this.tagsService.findAll();
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
