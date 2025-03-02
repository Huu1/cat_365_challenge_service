import {
  Entity,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  Index,
} from "typeorm";

import { TimeEntityBase } from "./lib/time-entity-base";
import { User } from "./user.entity";
import { Record } from "./record.entity";

@Entity()
export class Book extends TimeEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 20,
    nullable: false, // 明确禁止空值
    default: "", // 设置空字符串兜底
  })
  name: string;

  @ManyToOne(() => User, (user) => user.books)
  user: User;

  @OneToMany(() => Record, (record) => record.book) // 添加与 Record 的关系
  records: Record[];

  @Column({
    default: false,
    comment: "是否默认账本（每个用户有且只有一个）",
  })
  @Index(["user", "isDefault"], { unique: true, where: "isDefault = true" })
  isDefault: boolean;
}
