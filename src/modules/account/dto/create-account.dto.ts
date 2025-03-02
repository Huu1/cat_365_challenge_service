import { AccountType } from "@app/constants/enum";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateAccountDto {
    @IsInt()
    templateId: number;
  
    @Length(2, 20)
    @IsNotEmpty() // 新增非空校验
    name: string;

    @IsOptional()
    icon: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    balance: number;
  
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @IsOptional()
    @IsString()
    remarks?: string;
  
    @IsOptional()
    @IsBoolean()
    includeInTotal?: boolean;
}



export class CreateSystemAccountDto {
    @IsString()
    @Length(2, 20)
    name: string;
  
    @IsEnum(AccountType)
    type: AccountType;
  
    @IsString()
    icon: string;
  
  }
