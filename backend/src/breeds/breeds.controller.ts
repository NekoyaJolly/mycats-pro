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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BreedsService } from './breeds.service';
import { CreateBreedDto, UpdateBreedDto, BreedQueryDto } from './dto';

@ApiTags('Breeds')
@Controller('breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Post()
  @ApiOperation({ summary: '品種データを作成' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '品種データが正常に作成されました' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '無効なデータです' })
  create(@Body() createBreedDto: CreateBreedDto) {
    return this.breedsService.create(createBreedDto);
  }

  @Get()
  @ApiOperation({ summary: '品種データを検索・一覧取得' })
  @ApiResponse({ status: HttpStatus.OK, description: '品種データの一覧' })
  @ApiQuery({ name: 'page', required: false, description: 'ページ番号', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '1ページあたりの件数', example: 50 })
  @ApiQuery({ name: 'search', required: false, description: '検索キーワード' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'ソート項目', example: 'name' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'ソート順', example: 'asc' })
  findAll(@Query() query: BreedQueryDto) {
    return this.breedsService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: '品種データの統計情報を取得' })
  @ApiResponse({ status: HttpStatus.OK, description: '統計情報' })
  getStatistics() {
    return this.breedsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'IDで品種データを取得' })
  @ApiResponse({ status: HttpStatus.OK, description: '品種データ' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '品種データが見つかりません' })
  @ApiParam({ name: 'id', description: '品種データのID' })
  findOne(@Param('id') id: string) {
    return this.breedsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '品種データを更新' })
  @ApiResponse({ status: HttpStatus.OK, description: '品種データが正常に更新されました' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '品種データが見つかりません' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '無効なデータです' })
  @ApiParam({ name: 'id', description: '品種データのID' })
  update(@Param('id') id: string, @Body() updateBreedDto: UpdateBreedDto) {
    return this.breedsService.update(id, updateBreedDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '品種データを削除' })
  @ApiResponse({ status: HttpStatus.OK, description: '品種データが正常に削除されました' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '品種データが見つかりません' })
  @ApiParam({ name: 'id', description: '品種データのID' })
  remove(@Param('id') id: string) {
    return this.breedsService.remove(id);
  }
}
