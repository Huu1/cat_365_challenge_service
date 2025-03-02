import { Entity, ManyToOne, PrimaryColumn, JoinColumn, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, Index } from 'typeorm';

import { TimeEntityBase } from './lib/time-entity-base';
import { Account } from './account.entity';
import { Category } from './category.entity';
import { Book } from './book.entity';
import { IncomeandExpense } from '@app/constants/enum';

@Entity()
export class Record extends TimeEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { 
    precision: 10, 
    scale: 2,
    default: 0.00 ,
    comment: '交易金额（正数表示收入，负数表示支出）' 
  })
  amount: number;


  @Index()
  @Column({ 
    type: 'timestamp',
    comment: '交易发生时间' 
  })
  date: Date;

  @Column('text', { 
    nullable: true,
    comment: '交易备注说明' 
  })
  description?: string;

  @Column({
    type: 'enum',
    enum: IncomeandExpense,
    comment: '交易类型'
  })
  type: IncomeandExpense;

  @ManyToOne(() => Book, book => book.records)
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => Account, account => account.records)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Category, category => category.records)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // 添加明确外键列（便于复杂查询）
  @Column()
  bookId: number;

  @Column()
  accountId: number;

  @Column()
  categoryId: number;
}

