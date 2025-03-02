import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Book, User } from "@app/entities";
import { Repository } from "typeorm";
import { FailException } from "@app/exceptions/fail.exception";
import { ERROR_CODE } from "@app/constants/error-code.constant";
import { CreateBookDto } from "./dto/book.dto";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private bookRepo: Repository<Book>
  ) {}

  async createDefaultBook(user: User) {
    // 使用事务确保原子操作
    return this.bookRepo.manager.transaction(async (manager) => {
      try {
        // 双重检查锁模式防止并发问题
        const existing = await manager.findOne(Book, {
          where: { 
            user: { id: user.id }, 
            isDefault: true 
          },
          lock: { mode: "pessimistic_write" } // 悲观锁
        });
        if (existing) {
          console.log('12');
          return;
          
        }

        // 创建默认账本
        const defaultBook = manager.create(Book, {
          name: '默认账本',
          isDefault: true,
          user
        });

        await manager.insert(Book, defaultBook);

      } catch (error) {
        // 处理唯一约束冲突（Postgres错误代码 23505）
        if (error.code === '23505') {
          console.log('3');
          
          return;
        }
        
        throw new FailException(ERROR_CODE.COMMON.RESTRICTED_PERMISSIONS);
      }
    });
  }

  // 获取用户所有账本
  async getUserBooks(userId: number) {
    return this.bookRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: "DESC" }, // 默认账本置顶
    });
  }

  // 创建新账本
  async createBook(userId: number, dto: CreateBookDto) {
    return this.bookRepo.save({
      ...dto,
      isDefault: false, // 新建账本默认非默认
      user: { id: userId },
    });
  }

  // 删除账本
  async deleteBook(userId: number, BookId: number) {
    const book = await this.bookRepo.findOne({
      where: { id: BookId },
      relations: ["records"],
    });

    if(!book) {
      throw new FailException(ERROR_CODE.COMMON.RECORD_NOT_EXISTS);
    }

    if (book.isDefault) {
      throw new FailException(ERROR_CODE.COMMON.RESTRICTED_PERMISSIONS);
    }
    if (book.records?.length > 0) {
      throw new FailException(ERROR_CODE.COMMON.RECORD_ISRELATIVE);
    }

    return this.bookRepo.softDelete(BookId);
  }

  // 设置默认账本
  async setDefaultBook(userId: number, BookId: number) {
    return this.bookRepo.manager.transaction(async (manager) => {
      // 1. 取消当前默认账本
      await manager.update(
        Book,
        { user: { id: userId }, isDefault: true },
        { isDefault: false }
      );

      // 2. 设置新默认账本
      await manager.update(
        Book,
        { id: BookId, user: { id: userId } },
        { isDefault: true }
      );
    });
  }
}
