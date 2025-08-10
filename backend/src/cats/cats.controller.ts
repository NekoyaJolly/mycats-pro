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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { CatsService } from "./cats.service";
import { CreateCatDto, UpdateCatDto, CatQueryDto } from "./dto";

@ApiTags("Cats")
@Controller("cats")
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @ApiOperation({ summary: "猫データを作成" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "猫データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto);
  }

  @Get()
  @ApiOperation({ summary: "猫データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "猫データの一覧" })
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
  @ApiQuery({ name: "gender", required: false, description: "性別" })
  @ApiQuery({ name: "status", required: false, description: "ステータス" })
  @ApiQuery({ name: "ageMin", required: false, description: "最小年齢" })
  @ApiQuery({ name: "ageMax", required: false, description: "最大年齢" })
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
  findAll(@Query() query: CatQueryDto) {
    return this.catsService.findAll(query);
  }

  @Get("statistics")
  @ApiOperation({ summary: "猫データの統計情報を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "統計情報" })
  getStatistics() {
    return this.catsService.getStatistics();
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで猫データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "猫データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  findOne(@Param("id") id: string) {
    return this.catsService.findOne(id);
  }

  @Get(":id/breeding-history")
  @ApiOperation({ summary: "猫の繁殖履歴を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "繁殖履歴" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  getBreedingHistory(@Param("id") id: string) {
    return this.catsService.getBreedingHistory(id);
  }

  @Get(":id/care-history")
  @ApiOperation({ summary: "猫のケア履歴を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "ケア履歴" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  getCareHistory(@Param("id") id: string) {
    return this.catsService.getCareHistory(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "猫データを更新" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "猫データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  update(@Param("id") id: string, @Body() updateCatDto: UpdateCatDto) {
    return this.catsService.update(id, updateCatDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "猫データを削除" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "猫データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "猫データが見つかりません",
  })
  @ApiParam({ name: "id", description: "猫データのID" })
  remove(@Param("id") id: string) {
    return this.catsService.remove(id);
  }
}
