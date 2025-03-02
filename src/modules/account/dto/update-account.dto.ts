import { PartialType } from "@nestjs/mapped-types";
import { CreateAccountDto } from "./create-account.dto";
import { IsBoolean, IsInt, IsOptional, IsString, Length } from "class-validator";
import { AccountType } from "@app/constants/enum";

export class UpdateAccountDto extends PartialType(CreateAccountDto) {

  @IsInt()
  balance: number;

  @IsOptional()
  @Length(2, 20)
  name: string;

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

  @IsOptional()
  type?: AccountType;
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