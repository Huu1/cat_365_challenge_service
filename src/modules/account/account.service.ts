import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  CreateAccountDto,
  CreateSystemAccountDto,
} from "./dto/create-account.dto";
import {
  UpdateAccountDto,
  UpdateSystemAccountDto,
} from "./dto/update-account.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "@app/entities";
import { Repository } from "typeorm";
import { AccountType, AccounttypeMap } from "@app/constants/enum";
import { FailException } from "@app/exceptions/fail.exception";
import { ERROR_CODE } from "@app/constants/error-code.constant";

interface AssetSummary {
  totalAssets: number; // 总资产 = 资金 + 理财 + 应收
  totalLiabilities: number; // 总负债 = 信用 + 应付
  netWorth: number; // 净资产 = 总资产 - 总负债
  breakdown: {
    [key in AccountType]: number;
  };
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>
  ) {}

  // 创建用户账户
  async createFromTemplate(userId: number, dto: CreateAccountDto) {
    return this.accountRepo.manager.transaction(async (manager) => {
      // 获取系统模板
      const template = await manager.findOne(Account, {
        where: { id: dto.templateId, isSystem: true },
      });

      if (!template) {
        throw new FailException(ERROR_CODE.COMMON.RECORD_NOT_EXISTS);
      }

      // 处理默认账户设置
      if (dto.isDefault) {
        await manager.update(
          Account,
          { user: { id: userId }, isDefault: true },
          { isDefault: false }
        );
      }

      // 创建用户账户
      return manager.save(
        manager.create(Account, {
          icon: dto.icon || template.icon,
          name: dto.name,
          type: template.type,
          balance: dto.balance,
          remarks: dto.remarks,
          includeInTotal: dto.includeInTotal,
          isDefault: dto.isDefault,
          systemTemplate: template,
          user: { id: userId },
        })
      );
    });
  }

  // 获取可选的系统模板
  async getAvailableTemplates() {
    return this.accountRepo.find({
      where: { isSystem: true },
      select: ["id", "name", "type", "remarks", "icon"],
    });
  }

  async getUserAccounts(userId: number) {
    return this.accountRepo.find({
      where: { isSystem: false, user: { id: userId } },
      select: ["id", "name", "type", "remarks", "icon", "balance"],
    });
  }

  // 获取总资产
  async getSummarys(userId: number) {
    const accounts = await this.accountRepo.find({
      where: { user: { id: userId } },
    });

    const typeMap = {
      [AccountType.CASH]: "asset",
      [AccountType.INVESTMENT]: "asset",
      [AccountType.RECEIVABLE]: "asset",
      [AccountType.CREDIT]: "liability",
      [AccountType.PAYABLE]: "liability",
    };

    const summary = accounts.reduce(
      (acc, account) => {
        const category = typeMap[account.type];
        const amount = Number(account.balance);

        acc.breakdown[account.type] =
          (acc.breakdown[account.type] || 0) + amount;

        if (category === "asset") {
          acc.totalAssets += amount;
        } else {
          acc.totalLiabilities += Math.abs(amount); // 负债金额取正值
        }

        return acc;
      },
      {
        totalAssets: 0,
        totalLiabilities: 0,
        breakdown: {} as Record<AccountType, number>,
      }
    );

    return {
      ...summary,
      netWorth: summary.totalAssets - summary.totalLiabilities,
    };
  }

  // 删除用户账户
  async deleteAccount(userId: number, accountId: number) {
    console.log(userId, accountId);

    const account = await this.accountRepo.findOne({
      where: { id: accountId, user: { id: userId } },
      relations: ["records", "user"],
    });

    console.log(account);

    if (!account) throw new FailException(ERROR_CODE.COMMON.RECORD_NOT_EXISTS);

    if (account.isDefault)
      throw new FailException(ERROR_CODE.COMMON.RESTRICTED_PERMISSIONS);
    if (account.records?.length > 0) {
      throw new FailException(ERROR_CODE.COMMON.RECORD_ISRELATIVE);
    }

    return this.accountRepo.softDelete(account.id);
  }

  //创建系统账户
  async createSystemAccount(dto: CreateSystemAccountDto) {
    return this.accountRepo.save(
      this.accountRepo.create({
        ...dto,
        isSystem: true,
        balance: 0,
      })
    );
  }

  // 更新系统账户
  async updateSystemAccount(id: number, dto: UpdateSystemAccountDto) {
    const account = await this.accountRepo.findOneByOrFail({
      id,
      isSystem: true,
    });

    return this.accountRepo.save({
      ...account,
      ...dto,
      // 禁止修改账户类型
      type: account.type,
    });
  }

  // 在系统服务中添加初始化方法
  async seedSystemAccounts() {
    const exist = await this.accountRepo.count({ where: { isSystem: true } });
    if (exist > 0) return;

    const templates = [
      { name: "现金", type: AccountType.CASH, icon: "1" },
      {
        name: "信用卡",
        type: AccountType.CREDIT,
        includeInTotal: false,
        icon: "1",
      },
      { name: "股票账户", type: AccountType.INVESTMENT, icon: "1" },
      { name: "支付宝", type: AccountType.CASH, icon: "1" },
    ];

    await this.accountRepo.insert(
      templates.map((t) => ({
        ...t,
        isSystem: true,
        balance: 0,
      }))
    );
  }

  // 更新用户账户（禁止修改类型）
  async updateUserAccount(
    accountId: number,
    userId: number,
    dto: UpdateAccountDto
  ) {
    const account = await this.accountRepo.findOne({
      where: { isSystem: false, user: { id: userId }, id: accountId },
    });

    if (!account) {
      throw new FailException(ERROR_CODE.COMMON.RECORD_NOT_EXISTS);
    }

    return this.accountRepo.save({
      ...account,
      ...dto,
      // 禁止修改账户类型
      type: account.type,
    });
  }
}
