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
  Req,
} from "@nestjs/common";
import { RecordService } from "./record.service";
import { CreateRecordDto, QueryRecordsDto } from "./dto/create-record.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";
import { User } from "@app/decorators/user.decorator";
import { IPayLoad } from "@app/shared/auth";

@Controller("record")
export class RecordController {
  constructor(private readonly service: RecordService) {}

  @Get()
  async getRecords(
    @User() user:IPayLoad,
    @Query() query: QueryRecordsDto
  ) {
    return this.service.getUserRecords(user.id, query);
  }

  @Post("new")
  create(@Body() dto: CreateRecordDto, @User() user: IPayLoad) {
    return this.service.create(dto,user.id);
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
