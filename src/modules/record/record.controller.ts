import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { RecordService } from "./record.service";
import { CreateRecordDto } from "./dto/create-record.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";

@Controller("record")
export class RecordController {
  constructor(private readonly service: RecordService) {}

  @Post('new')
  create(@Body() dto: CreateRecordDto) {
    return this.service.create(dto);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.findOne(+id);
  }

  @Post("update/:id")
  update(@Param("id") id: string, @Body() dto: UpdateRecordDto) {
    return this.service.update(+id, dto);
  }

  @Post("remove/:id")
  delete(@Param("id") id: string) {
    return this.service.delete(+id);
  }
}
