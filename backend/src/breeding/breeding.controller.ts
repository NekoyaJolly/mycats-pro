import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus, UseGuards 
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";


import { BreedingService } from "./breeding.service";
import {
  BreedingQueryDto,
  CreateBreedingDto,
  UpdateBreedingDto,
  CreateBreedingNgRuleDto,
  UpdateBreedingNgRuleDto,
} from "./dto";

@ApiTags("Breeding")
@Controller("breeding")
export class BreedingController {
  constructor(private readonly breedingService: BreedingService) {}

  @Get()
  @ApiOperation({ summary: "交配記録一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findAll(@Query() query: BreedingQueryDto) {
    return this.breedingService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "交配記録の新規作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(
    @Body() dto: CreateBreedingDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.breedingService.create(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiOperation({ summary: "交配記録の更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  update(@Param("id") id: string, @Body() dto: UpdateBreedingDto) {
    return this.breedingService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @ApiOperation({ summary: "交配記録の削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  remove(@Param("id") id: string) {
    return this.breedingService.remove(id);
  }

  @Get("ng-rules")
  @ApiOperation({ summary: "NGペアルール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findNgRules() {
    return this.breedingService.findNgRules();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("ng-rules")
  @ApiOperation({ summary: "NGペアルールの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createNgRule(@Body() dto: CreateBreedingNgRuleDto) {
    return this.breedingService.createNgRule(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("ng-rules/:id")
  @ApiOperation({ summary: "NGペアルールの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updateNgRule(@Param("id") id: string, @Body() dto: UpdateBreedingNgRuleDto) {
    return this.breedingService.updateNgRule(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("ng-rules/:id")
  @ApiOperation({ summary: "NGペアルールの削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removeNgRule(@Param("id") id: string) {
    return this.breedingService.removeNgRule(id);
  }
}
