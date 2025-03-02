import { IsOptional, IsString, Matches } from "class-validator";

export class MonthlyStatsDto {
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: '月份格式应为YYYY-MM（如：2024-03）'
  })
  @IsOptional()
  month?: string;

  // 自动填充当前月
  static format(month?: string): string {
    if (!month) {
      const d = new Date();
      return `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    }
    
    return month;
  }
}
