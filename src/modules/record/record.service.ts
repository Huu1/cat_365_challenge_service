import { Injectable } from "@nestjs/common";
import { CreateRecordDto, QueryRecordsDto } from "./dto/create-record.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";
import { Account, Book, Category, Record } from "@app/entities";
import { DataSource, EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { IncomeandExpense, PaginatedResult } from "@app/constants/enum";
import { FailException } from "@app/exceptions/fail.exception";
import { ERROR_CODE } from "@app/constants/error-code.constant";

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
  async create(dto: CreateRecordDto, userId: number): Promise<Record> {
    return this.dataSource.transaction(async (manager) => {
      await this.validateRelationsExist(manager, dto, userId);
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

    account.balance = Number(
      (Number(account.balance) + value * multiplier).toFixed(2)
    );

    await manager.save(Account, account);
  }

  private async validateRelationsExist(
    manager: EntityManager,
    dto: CreateRecordDto,
    userId: number
  ) {
    const [book, account, category] = await Promise.all([
      manager.findOneBy(Book, { id: dto.bookId, user: { id: userId } }),
      manager.findOneBy(Account, { id: dto.accountId, user: { id: userId } }),
      manager.findOneBy(Category, { id: dto.categoryId, user: { id: userId } }),
    ]);

    console.log([book, account, category]);
    

    if (!book || !account || !category)
      throw new FailException(ERROR_CODE.COMMON.RECORD_NOT_EXISTS);
  }

  // src/modules/record/record.service.ts
  async getUserRecords(
    userId: number,
    query: QueryRecordsDto
  ): Promise<PaginatedResult<Record>> {
    const { type, startDate, endDate, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.recordRepo
      .createQueryBuilder("record")
      .leftJoinAndSelect("record.account", "account")
      .leftJoinAndSelect("record.category", "category")
      .innerJoin("record.book", "book")
      .where("book.user_id = :userId", { userId })
      .orderBy("record.date", "DESC")
      .addOrderBy("record.createdAt", "DESC");

    // 类型过滤
    if (type) {
      queryBuilder.andWhere("record.type = :type", { type });
    }

    // 日期范围过滤
    if (startDate) {
      queryBuilder.andWhere("record.date >= :startDate", {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      queryBuilder.andWhere("record.date <= :endDate", {
        endDate: new Date(endDate),
      });
    }

    // 分页处理
    const [items, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data: items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
