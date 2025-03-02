import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { TimeEntityBase } from "./lib/time-entity-base";
import { User } from "./user.entity";
import { Record } from "./record.entity";
import { IncomeandExpense } from "@app/constants/enum";

@Entity()
export class Category extends TimeEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 20,
    nullable: false, // 明确禁止空值
    default: "", // 设置空字符串兜底
  })
  name: string;

  @Column({ nullable: true, comment: "图标名称或URL" }) // 新增图标字段
  icon: string;

  @Column({
    type: "enum",
    enum: IncomeandExpense,
    comment: "分类类型：income-收入，expense-支出",
  })
  type: IncomeandExpense; // 新增类型字段

  // Category.user 应明确设置级联操作
  @ManyToOne(() => User, (user) => user.categories, {
    nullable: true,
    onDelete: "CASCADE", // 用户删除时处理分类
  })
  user: User | null;

  @Column({ default: false })
  isDefault: boolean; // 标记是否为默认分类

  @OneToMany(() => Record, (record) => record.category)
  records: Record[];
}
