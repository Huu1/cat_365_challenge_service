import { Injectable } from "@nestjs/common";
import { MonthlyStatsDto } from "./dto/monthly-analysis.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Record } from "@app/entities";
import { Repository } from "typeorm";
import { DailyStatsWithRecords } from "./dto/daily-stats-full.dto";

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>
  ) {}
  // src/modules/analysis/analysis.service.ts
  async getMonthlyStats(userId: number, dto: MonthlyStatsDto) {
    const month = MonthlyStatsDto.format(dto.month);
    const { startDate, endDate } = this.parseDateRange(month);

    // 获取基础统计
    const { income, expense } = await this.getUserFinancials(
      userId,
      startDate,
      endDate
    );

    // 计算结余
    const netSurplus = income - expense;

    return {
      month,
      income: this.formatCurrency(income),
      expense: this.formatCurrency(expense),
      net_surplus: this.formatCurrency(netSurplus),
      start_date: startDate,
      end_date: endDate,
    };
  }

  private async getUserFinancials(userId: number, start: Date, end: Date) {
    const result = await this.recordRepo
      .createQueryBuilder("record")
      .select([
        "SUM(CASE WHEN type = 1 THEN amount ELSE 0 END) AS income",
        "SUM(CASE WHEN type = 2 THEN amount ELSE 0 END) AS expense",
      ])
      .innerJoin("record.book", "book", "book.user_id = :userId", { userId })
      .where("record.date BETWEEN :start AND :end", { start, end })
      .getRawOne();

    return {
      income: Number(result?.income || 0),
      expense: Number(result?.expense || 0),
    };
  }

  private parseDateRange(month?: string) {
    const now = new Date();
    const [year, monthStr] = month
      ? month.split("-")
      : [now.getFullYear(), now.getMonth() + 1];

    const startDate = new Date(Number(year), Number(monthStr) - 1, 1);
    const endDate = new Date(Number(year), Number(monthStr), 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  private formatCurrency(value: number): string {
    return (value.toFixed(2) + "")
    // return value.toLocaleString("zh-CN", {
    //   style: "currency",
    //   currency: "CNY",
    //   minimumFractionDigits: 2,
    // });
  }

  async getDailyStatsWithRecords(
    userId: number,
    month: string
  ): Promise<DailyStatsWithRecords[]> {
    const { startDate, endDate } = this.parseMonthRange(month);

    const rawData = await this.recordRepo
      .createQueryBuilder("record")
      .select([
        "DATE_FORMAT(record.date, '%Y-%m-%d') AS group_date",
        "record.id AS record_id",
        "record.amount AS record_amount",
        "record.type AS record_type",
        "record.date AS record_date",
        "category.name AS category_name",
        "category.icon AS category_icon",
        // 修正窗口函数中的日期格式化
        `SUM(CASE WHEN record.type = 1 THEN record.amount ELSE 0 END) 
       OVER (PARTITION BY DATE_FORMAT(record.date, '%Y-%m-%d')) AS total_income`,
        `SUM(CASE WHEN record.type = 2 THEN record.amount ELSE 0 END) 
       OVER (PARTITION BY DATE_FORMAT(record.date, '%Y-%m-%d')) AS total_expense`,
      ])
      .innerJoin("record.book", "book", "book.user_id = :userId", { userId })
      .leftJoin("record.category", "category")
      .where("record.date BETWEEN :start AND :end", {
        start: startDate,
        end: endDate,
      })
      .orderBy("record.date", "DESC")
      .getRawMany();

    // 分组处理
    const grouped = rawData.reduce((acc, curr) => {
      const dateKey = curr.group_date;
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          total_income: Number(curr.total_income),
          total_expense: Number(curr.total_expense),
          records: [],
        };
      }

      acc[dateKey].records.push({
        id: curr.record_id,
        amount: Number(curr.record_amount),
        type: curr.record_type,
        category_name: curr.category_name,
        category_icon: curr.category_icon,
        date: curr.record_date,
      });

      return acc;
    }, {});

    // 转换为数组并按日期倒序排列
    return Object.values(grouped).sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    ) as DailyStatsWithRecords[];
  }

  private parseMonthRange(month: string) {
    const [year, m] = month.split("-");
    return {
      startDate: new Date(Number(year), Number(m) - 1, 1),
      endDate: new Date(Number(year), Number(m), 0, 23, 59, 59),
    };
  }
}
