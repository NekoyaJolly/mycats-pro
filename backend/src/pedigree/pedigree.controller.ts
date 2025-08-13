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

import { CreatePedigreeDto, UpdatePedigreeDto, PedigreeQueryDto } from "./dto";
import { PedigreeService } from "./pedigree.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RoleGuard } from "../auth/role.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("Pedigrees")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("pedigrees")
export class PedigreeController {
  constructor(private readonly pedigreeService: PedigreeService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "血統書データを作成（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "血統書データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  create(@Body() createPedigreeDto: CreatePedigreeDto) {
    return this.pedigreeService.create(createPedigreeDto);
  }

  @Get()
  @ApiOperation({ summary: "血統書データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "血統書データの一覧" })
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
    example: 10,
  })
  @ApiQuery({ name: "search", required: false, description: "検索キーワード" })
  @ApiQuery({ name: "breedId", required: false, description: "品種ID" })
  @ApiQuery({ name: "colorId", required: false, description: "毛色ID" })
  @ApiQuery({
    name: "gender",
    required: false,
    description: "性別 (1: オス, 2: メス)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "ソート項目",
    example: "createdAt",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "desc",
  })
  findAll(@Query() query: PedigreeQueryDto) {
    return this.pedigreeService.findAll(query);
  }

  @Get("pedigree-id/:pedigreeId")
  @ApiOperation({ summary: "血統書番号で血統書データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "血統書データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "pedigreeId", description: "血統書番号" })
  findByPedigreeId(@Param("pedigreeId") pedigreeId: string) {
    return this.pedigreeService.findByPedigreeId(pedigreeId);
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで血統書データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "血統書データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  findOne(@Param("id") id: string) {
    return this.pedigreeService.findOne(id);
  }

  @Get(":id/family-tree")
  @ApiOperation({ summary: "血統書の家系図を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "家系図データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  getFamilyTree(@Param("id") id: string) {
    return this.pedigreeService.getFamilyTree(id);
  }

  @Get(":id/family")
  @ApiOperation({ summary: "血統書データの家系図を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "家系図データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  @ApiQuery({
    name: "generations",
    required: false,
    description: "取得する世代数",
    example: 3,
  })
  getFamily(
    @Param("id") id: string,
    @Query("generations") generations?: number,
  ) {
    return this.pedigreeService.getFamily(id, generations);
  }

  @Get(":id/descendants")
  @ApiOperation({ summary: "血統書データの子孫を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "子孫データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  getDescendants(@Param("id") id: string) {
    return this.pedigreeService.getDescendants(id);
  }

  @Patch(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "血統書データを更新（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "血統書データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  update(
    @Param("id") id: string,
    @Body() updatePedigreeDto: UpdatePedigreeDto,
  ) {
    return this.pedigreeService.update(id, updatePedigreeDto);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "血統書データを削除（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "血統書データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  remove(@Param("id") id: string) {
    return this.pedigreeService.remove(id);
  }
}
