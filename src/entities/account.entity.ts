import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TimeEntityBase } from "./lib/time-entity-base";
import { User } from "./user.entity";
import { Record } from "./record.entity";
import { AccountType } from "@app/constants/enum";

@Entity()
export class Account extends TimeEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 20,
    nullable: false, // 明确禁止空值
    default: "", // 设置空字符串兜底
  })
  name: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: false, // 明确禁止空值
    default: "", // 设置空字符串兜底
  })
  icon: string;

  @Column({
    type: "enum",
    enum: AccountType,
    comment: "账户类型（继承自系统账户）",
  })
  type: AccountType;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  balance: number;

  @Column({
    type: "text",
    nullable: true,
  })
  remarks: string; // 新增备注字段

  @Column({
    default: true,
    comment: "是否计入总资产统计",
  })
  includeInTotal: boolean;

  @Column({
    default: false,
    comment: "是否系统级模板账户",
  })
  isSystem: boolean;

  @Column({
    default: false,
    comment: "是否默认账户",
  })
  isDefault: boolean;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: "system_template_id" })
  systemTemplate?: Account; // 关联系统模板

  @Column({ nullable: true })
  systemTemplateId?: number;

  @ManyToOne(() => User, (user) => user.accounts)
  user: User;

  @OneToMany(() => Record, (record) => record.account)
  records: Record[];
}
