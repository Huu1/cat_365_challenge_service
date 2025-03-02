import { IncomeandExpense } from "@app/constants/enum";
import { Type } from "class-transformer";
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
  isInt,
} from "class-validator";

export class CreateRecordDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsISO8601()
  @Type(() => String) // 处理 ISO8601 类型转换
  date?: Date;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  @Type(() => String) // 处理 string 类型转换
  description?: string;

  @IsInt()
  @IsPositive()
  accountId: number;

  @IsInt()
  @IsPositive()
  categoryId: number;

  @IsInt()
  @IsPositive()
  bookId: number;

  @IsEnum(IncomeandExpense)
  @IsNotEmpty()
  type: IncomeandExpense; // 必须指定类型
}


// src/modules/record/dto/query-records.dto.ts
export class QueryRecordsDto {
  @IsInt()
  @IsIn([1, 2])
  @Type(() => Number) // 自动转换类型
  @IsOptional()
  type?: 1 | 2;

  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  @ValidateIf(o => o.startDate) // endDate 需要 startDate 存在
  endDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;
}
