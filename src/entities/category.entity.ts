import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TimeEntityBase } from "./lib/time-entity-base";
import { User } from "./user.entity";
import { Record } from "./record.entity";
import { IncomeandExpense } from "@app/constants/enum";

@Entity()
export class Category extends TimeEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, comment: "图标名称或URL" }) // 新增图标字段
  icon: string;

  @Column({
    type: "enum",
    enum: IncomeandExpense,
    comment: "分类类型：income-收入，expense-支出",
  })
  type: IncomeandExpense; // 新增类型字段

  @ManyToOne(() => User, (user) => user.categories, { nullable: true })
  user: User | null; // 用户自定义分类，可能为空

  @Column({ default: false })
  isDefault: boolean; // 标记是否为默认分类

  @OneToMany(() => Record, (record) => record.category)
  records: Record[];
}
