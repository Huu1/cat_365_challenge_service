export class DailyStatsWithRecords {
  // @ApiProperty({ description: "日期(YYYY-MM-DD)" })
  date: string;

  // @ApiProperty({ description: "当日总收入", example: 1500.5 })
  total_income: number;

  // @ApiProperty({ description: "当日总支出", example: 800.0 })
  total_expense: number;

  // @ApiProperty({
  //     type: [EnhancedRecord],
  //     description: "当日记录（按记录日期倒序排列）",
  //   })
  records: EnhancedRecord[];
}

class EnhancedRecord {
  // @ApiProperty({ description: "记录ID" })
  id: number;

  // @ApiProperty({ description: "金额", example: 100.5 })
  amount: number;

  // @ApiProperty({
  //     enum: [1, 2],
  //     description: "类型: 1-收入, 2-支出",
  //   })
  type: number;

  // @ApiProperty({ description: "分类名称", example: "餐饮美食" })
  category_name: string;

  // @ApiProperty({
  // description: "分类图标",
  //     example: "food.png",
  //   })
  category_icon: string;

  // @ApiProperty({
  //     description: "记录日期",
  //     example: "2024-03-15T08:00:00.000Z",
  //   })
  date: string;
}
