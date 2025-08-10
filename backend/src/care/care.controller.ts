import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CareService } from "./care.service";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GetUser } from "../auth/get-user.decorator";
import { CareQueryDto } from "./dto/care-query.dto";
import { CompleteCareDto } from "./dto/complete-care.dto";
import { CreateCareScheduleDto } from "./dto/create-care-schedule.dto";

@ApiTags("Care")
@Controller("care")
export class CareController {
  constructor(private readonly careService: CareService) {}

  @Get("schedules")
  @ApiOperation({ summary: "ケアスケジュール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findSchedules(@Query() query: CareQueryDto) {
    return this.careService.findSchedules(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("schedules")
  @ApiOperation({ summary: "ケアスケジュールの追加" })
  @ApiResponse({ status: HttpStatus.CREATED })
  addSchedule(@Body() dto: CreateCareScheduleDto, @GetUser() user?: any) {
    return this.careService.addSchedule(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("schedules/:id/complete")
  @ApiOperation({ summary: "ケア完了処理" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  complete(
    @Param("id") id: string,
    @Body() dto: CompleteCareDto,
    @GetUser() user?: any,
  ) {
    return this.careService.complete(id, dto, user?.userId);
  }
}
