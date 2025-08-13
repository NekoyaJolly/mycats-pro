import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { CoatColorsService } from "./coat-colors.service";
import {
  CreateCoatColorDto,
  UpdateCoatColorDto,
  CoatColorQueryDto,
} from "./dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RoleGuard } from "../auth/role.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("Coat Colors")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("coat-colors")
export class CoatColorsController {
  constructor(private readonly coatColorsService: CoatColorsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "毛色データを作成（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "毛色データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  create(@Body() createCoatColorDto: CreateCoatColorDto) {
    return this.coatColorsService.create(createCoatColorDto);
  }

  @Get()
  @ApiOperation({ summary: "毛色データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "毛色データの一覧" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "ページ番号",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "1ページあたりの件数",
    example: 50,
  })
  @ApiQuery({ name: "search", required: false, description: "検索キーワード" })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "ソート項目",
    example: "name",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "asc",
  })
  findAll(@Query() query: CoatColorQueryDto) {
    return this.coatColorsService.findAll(query);
  }

  @Get("statistics")
  @ApiOperation({ summary: "毛色データの統計情報を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "統計情報" })
  getStatistics() {
    return this.coatColorsService.getStatistics();
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで毛色データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "毛色データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "毛色データが見つかりません",
  })
  @ApiParam({ name: "id", description: "毛色データのID" })
  findOne(@Param("id") id: string) {
    return this.coatColorsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "毛色データを更新（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "毛色データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "毛色データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "毛色データのID" })
  update(
    @Param("id") id: string,
    @Body() updateCoatColorDto: UpdateCoatColorDto,
  ) {
    return this.coatColorsService.update(id, updateCoatColorDto);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "毛色データを削除（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "毛色データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "毛色データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "毛色データのID" })
  remove(@Param("id") id: string) {
    return this.coatColorsService.remove(id);
  }
}
