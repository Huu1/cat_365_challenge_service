import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { AccountService } from "./account.service";
import {
  CreateAccountDto,
  CreateSystemAccountDto,
} from "./dto/create-account.dto";
import {
  UpdateAccountDto,
  UpdateSystemAccountDto,
} from "./dto/update-account.dto";
import { User } from "@app/decorators/user.decorator";
import { IPayLoad } from "@app/shared/auth";

@Controller("account")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // 获取系统模板
  @Get("templates")
  async getTemplates() {
    return this.accountService.getAvailableTemplates();
  }

  @Get()
  async getAllAccounts(@User() user: IPayLoad) {
    return this.accountService.getUserAccounts(user.id);
  }

  // 添加用户账户
  @Post("add")
  async createAccount(@User() user: IPayLoad, @Body() dto: CreateAccountDto) {
    return this.accountService.createFromTemplate(user.id, dto);
  }

  // 移除用户账户
  @Post("remove/:id")
  deleteAccount(
    @Param("id", ParseIntPipe) accountId: number,
    @User() user: IPayLoad
  ) {
    return this.accountService.deleteAccount(user.id, accountId);
  }

  // 添加系统模板
  @Post("add-system")
  async createSystemAccount(@Body() dto: CreateSystemAccountDto) {
    return this.accountService.createSystemAccount(dto);
  }

  // 更新系统模板
  @Post("update-system/:id")
  async updateSystemAccount(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateSystemAccountDto
  ) {
    return this.accountService.updateSystemAccount(id, dto);
  }

  // 获取资产详情
  @Get("summary")
  getSummary(@User() user: IPayLoad) {
    return this.accountService.getAssetSummary(user.id);
  }

  @Post("init")
  async seedSystemAccounts() {
    return this.accountService.seedSystemAccounts();
  }
}
