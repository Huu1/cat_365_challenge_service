import { Entity, ManyToOne, PrimaryColumn, JoinColumn, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';

import { TimeEntityBase } from './lib/time-entity-base';
import { Account } from './account.entity';
import { Category } from './category.entity';
import { Book } from './book.entity';
import { IncomeandExpense } from '@app/constants/enum';

@Entity()
export class Record  extends TimeEntityBase{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column('decimal')
    amount: number;

    @Column()
    date: Date;

    @Column()
    description: string;

    @Column({ type: 'enum', enum: IncomeandExpense })
    type: IncomeandExpense;

    @ManyToOne(() => Book, book => book.records) // 与 Book 的关系
    book: Book;


    @ManyToOne(() => Account, account => account.records) // 确保与 Account 的关系
    account: Account;

    @ManyToOne(() => Category, category => category.records) // 与 Category 的关系
    category: Category;

}
