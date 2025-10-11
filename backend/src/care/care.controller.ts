import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Post,
  Query, UseGuards 
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CareService } from "./care.service";
import {
  CareCompleteResponseDto,
  CareQueryDto,
  CareScheduleListResponseDto,
  CareScheduleResponseDto,
  CompleteCareDto,
  CreateCareScheduleDto,
} from "./dto";

@ApiTags("Care")
@Controller("care")
export class CareController {
  constructor(private readonly careService: CareService) {}

  @Get("schedules")
  @ApiOperation({ summary: "ケアスケジュール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK, type: CareScheduleListResponseDto })
  findSchedules(@Query() query: CareQueryDto) {
    return this.careService.findSchedules(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("schedules")
  @ApiOperation({ summary: "ケアスケジュールの追加" })
  @ApiResponse({ status: HttpStatus.CREATED, type: CareScheduleResponseDto })
  addSchedule(
    @Body() dto: CreateCareScheduleDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.addSchedule(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("schedules/:id/complete")
  @Put("schedules/:id/complete")
  @ApiOperation({ summary: "ケア完了処理（PATCH/PUT対応）" })
  @ApiResponse({ status: HttpStatus.OK, type: CareCompleteResponseDto })
  @ApiParam({ name: "id" })
  complete(
    @Param("id") id: string,
    @Body() dto: CompleteCareDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.complete(id, dto, user?.userId);
  }
}
