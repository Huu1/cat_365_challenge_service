import { Entity, ManyToOne, PrimaryColumn, JoinColumn, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';

import { TimeEntityBase } from './lib/time-entity-base';
import { User } from './user.entity';
import { Account } from './account.entity';
import { Category } from './category.entity';
import { Record } from './record.entity';

@Entity()
export class Book  extends TimeEntityBase{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, user => user.books)
    user: User;
  

    @OneToMany(() => Record, record => record.book) // 添加与 Record 的关系
    records: Record[];

    

}
