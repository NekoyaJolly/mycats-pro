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

import { BreedsService } from "./breeds.service";
import { CreateBreedDto, UpdateBreedDto, BreedQueryDto } from "./dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RoleGuard } from "../auth/role.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("Breeds")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("breeds")
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "品種データを作成（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "品種データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  create(@Body() createBreedDto: CreateBreedDto) {
    return this.breedsService.create(createBreedDto);
  }

  @Get()
  @ApiOperation({ summary: "品種データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "品種データの一覧" })
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
  findAll(@Query() query: BreedQueryDto) {
    return this.breedsService.findAll(query);
  }

  @Get("statistics")
  @ApiOperation({ summary: "品種データの統計情報を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "統計情報" })
  getStatistics() {
    return this.breedsService.getStatistics();
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで品種データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "品種データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "品種データが見つかりません",
  })
  @ApiParam({ name: "id", description: "品種データのID" })
  findOne(@Param("id") id: string) {
    return this.breedsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "品種データを更新（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "品種データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "品種データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "品種データのID" })
  update(@Param("id") id: string, @Body() updateBreedDto: UpdateBreedDto) {
    return this.breedsService.update(id, updateBreedDto);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "品種データを削除（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "品種データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "品種データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "品種データのID" })
  remove(@Param("id") id: string) {
    return this.breedsService.remove(id);
  }
}
