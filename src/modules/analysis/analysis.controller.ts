import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { MonthlyStatsDto } from "./dto/monthly-analysis.dto";
import { IPayLoad } from "@app/shared/auth";
import { User } from "@app/decorators/user.decorator";

@Controller("analysis")
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get("monthly-stats")
  async getMonthlyStats(@User() user: IPayLoad, @Query() dto: MonthlyStatsDto) {
    return this.analysisService.getMonthlyStats(user.id, dto);
  }

  @Get("daily-full")
  // @ApiOperation({ summary: "获取每日完整统计（含记录）" })
  async getDailyStatsWithRecords(
    @User() user: IPayLoad,
    @Query() dto: MonthlyStatsDto
  ) {
    const month = MonthlyStatsDto.format(dto.month);
    return this.analysisService.getDailyStatsWithRecords(user.id, month);
  }
}
