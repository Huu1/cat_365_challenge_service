import { IsOptional, IsString, Length } from "class-validator";

export class CreateBookDto {
    @IsString()
    @Length(2, 20)
    name: string;
  }
  
  // src/modules/ledger/dto/update-ledger.dto.ts
  export class UpdateLedgerDto {
    @IsOptional()
    @Length(2, 20)
    name?: string;
  }