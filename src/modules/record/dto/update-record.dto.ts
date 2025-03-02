import { PartialType } from "@nestjs/mapped-types";
import { CreateRecordDto } from "./create-record.dto";
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { Type } from "class-transformer";
import { IncomeandExpense } from "@app/constants/enum";

export class UpdateRecordDto extends PartialType(CreateRecordDto) {
  @IsDecimal({ decimal_digits: "2" })
  @Type(() => String) // 处理 decimal 类型转换
  amount?: number;

  @IsISO8601()
  @IsOptional()
  date?: Date;

  @IsString()
  @Length(1, 255)
  @IsOptional()
  description?: string;

  @IsEnum(IncomeandExpense)
  @IsOptional()
  type?: IncomeandExpense;

  @IsInt()
  @IsOptional()
  bookId?: number;

  @IsInt()
  categoryId?: number;
}
