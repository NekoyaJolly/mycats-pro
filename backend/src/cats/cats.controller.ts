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
  Logger,
  UseGuards,
  ParseUUIDPipe,
  Header,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CatsService } from "./cats.service";
import { CreateCatDto, UpdateCatDto, CatQueryDto } from "./dto";

@ApiTags("Cats")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("cats")
export class CatsController {
  private readonly logger = new Logger(CatsController.name);

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
    this.logger.log({
      message: 'Creating new cat',
      catName: createCatDto.name,
      breedId: createCatDto.breedId,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.create(createCatDto);
  }

  @Get()
  @Header('Cache-Control', 'no-cache')
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
  @ApiQuery({ name: "coatColorId", required: false, description: "毛色ID" })
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
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
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
  getBreedingHistory(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
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
  getCareHistory(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
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
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateCatDto: UpdateCatDto,
  ) {
    this.logger.log({
      message: 'Updating cat',
      catId: id,
      fields: Object.keys(updateCatDto),
      timestamp: new Date().toISOString(),
    });
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
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    this.logger.warn({
      message: 'Deleting cat',
      catId: id,
      timestamp: new Date().toISOString(),
    });
    return this.catsService.remove(id);
  }
}
