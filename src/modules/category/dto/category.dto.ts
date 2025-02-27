import { IncomeandExpense } from "@app/constants/enum";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";
export class CreateCategoryDto {
  @IsString()
  @Length(2, 20)
  name: string;

  @IsEnum(IncomeandExpense)
  type: IncomeandExpense; // 必须指定类型

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @Length(2, 20)
  name?: string;

  @IsOptional()
  @IsEnum(IncomeandExpense)
  type?: IncomeandExpense;

  @IsOptional()
  @IsString()
  icon?: string;
}

