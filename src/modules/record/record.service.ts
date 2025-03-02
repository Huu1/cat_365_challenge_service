import { Injectable } from "@nestjs/common";
import { CreateRecordDto } from "./dto/create-record.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";
import { Account, Book, Category, Record } from "@app/entities";
import { DataSource, EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { IncomeandExpense } from "@app/constants/enum";

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private dataSource: DataSource
  ) {}

  // 创建记录并更新账户余额
  async create(dto: CreateRecordDto): Promise<Record> {
    return this.dataSource.transaction(async (manager) => {
      const record = await this.createRecord(manager, dto);
      await this.updateAccountBalance(
        manager,
        dto.accountId,
        dto.amount,
        dto.type,
        "create"
      );
      return record;
    });
  }

  // 获取记录详情（带关联实体）
  async findOne(id: number) {
    return this.recordRepo.findOne({
      where: { id },
      relations: ["account", "category", "book"],
    });
  }

  // 更新记录并处理账户变更
  async update(id: number, dto: UpdateRecordDto): Promise<Record> {
    return this.dataSource.transaction(async (manager) => {
      const original = await manager.findOne(Record, {
        where: { id },
        lock: { mode: "pessimistic_write" },
      });

      if (original) {
        // 处理账户变更或金额修改
        if (
          dto.accountId !== original.accountId ||
          dto.amount !== original.amount
        ) {
          // 回滚原账户余额
          await this.updateAccountBalance(
            manager,
            original.accountId,
            original.amount,
            original.type,
            "revert"
          );

          // 应用新账户余额
          await this.updateAccountBalance(
            manager,
            dto.accountId || original.accountId,
            dto.amount || original.amount,
            dto.type || original.type,
            "create"
          );
        }
      }

      return manager.save(Record, { ...original, ...dto });
    });
  }

  // 删除记录并回滚余额
  async delete(id: number): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const record = await manager.findOne(Record, {
        where: { id },
        lock: { mode: "pessimistic_write" },
      });

      if (record) {
        await this.updateAccountBalance(
          manager,
          record.accountId,
          record.amount,
          record.type,
          "revert"
        );
        await manager.remove(Record, record);
      }
    });
  }

  // 私有方法：创建记录
  private async createRecord(
    manager: EntityManager,
    dto: CreateRecordDto
  ): Promise<Record> {
    return manager.save(Record, {
      ...dto,
      date: dto.date || new Date(),
    });
  }

  // 私有方法：更新账户余额（核心逻辑）
  private async updateAccountBalance(
    manager: EntityManager,
    accountId: number,
    amount: number,
    type: IncomeandExpense,
    operation: "create" | "revert"
  ): Promise<void> {
    const account = await manager.findOne(Account, {
      where: { id: accountId },
      lock: { mode: "pessimistic_write" },
    });

    if (!account) throw new Error("Account not found");

    const value = type === IncomeandExpense.income ? amount : -amount;
    const multiplier = operation === "revert" ? -1 : 1;

    console.log(
      account,
      value,
      multiplier,
      account.balance + value * multiplier
    );

    account.balance = Number(
      (Number(account.balance) + value * multiplier).toFixed(2)
    );

    await manager.save(Account, account);
  }
}
