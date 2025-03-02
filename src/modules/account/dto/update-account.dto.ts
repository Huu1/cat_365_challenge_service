import { PartialType } from "@nestjs/mapped-types";
import { CreateAccountDto } from "./create-account.dto";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length } from "class-validator";
import { AccountType } from "@app/constants/enum";

export class UpdateAccountDto extends PartialType(CreateAccountDto) {

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  balance?: number;

  @IsOptional()
  @Length(2, 20)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsBoolean()
  includeInTotal?: boolean;

  @IsOptional()
  icon?: string;

}


export class UpdateSystemAccountDto {

  @IsString()
  @IsOptional()
  @Length(2, 20)
  name: string;


  @IsString()
  @IsOptional()
  @Length(2, 20)
  icon: string;

  @IsOptional()
  type?: AccountType;

  @IsOptional()
  @IsBoolean()
  includeInTotal?: boolean;
}