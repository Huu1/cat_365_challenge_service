import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TimeEntityBase } from "./lib/time-entity-base";
import { User } from "./user.entity";
import { Record } from "./record.entity";

@Entity()
export class Account extends TimeEntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column("decimal", { precision: 10, scale: 2 }) // 例如：总位数10，小数位2
  balance: number;

  @ManyToOne(() => User, (user) => user.accounts)
  user: User;

  @OneToMany(() => Record, (record) => record.account) // 确保与 Record 的关系
  records: Record[];
}
