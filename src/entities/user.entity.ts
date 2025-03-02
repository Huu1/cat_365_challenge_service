import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { TimeEntityBase } from "./lib/time-entity-base";
import { USER_STATUS, USER_ADMIN } from "@app/modules/user/user.constant";
import { Book } from "./book.entity";
import { Account } from "./account.entity";
import { Category } from "./category.entity";

@Entity()
export class User extends TimeEntityBase {
  @PrimaryGeneratedColumn("increment", { comment: "user id" })
  id: number;

  @Column("varchar", {
    unique: true,
    nullable: true,
    length: 100,
    comment: "unionid，微信 unionid",
  })
  unionid: string;

  @Column("varchar", {
    unique: true,
    nullable: false,
    length: 100,
    comment: "openid，微信 openid",
  })
  openid: string;

  @Column("varchar", { length: 30, nullable: true, comment: "username" })
  username: string;

  @Column("int", {
    default: 0,
    comment: "0表示审核通过，1 表示审核中，2 表示拒绝",
  })
  verify_name_status: number;

  @Column("varchar", { nullable: true, length: 80, comment: "password" })
  password: string | null;

  @Column("varchar", { nullable: true, length: 100, comment: "email" })
  email: string;

  @Column("tinyint", {
    unsigned: true,
    nullable: false,
    default: USER_STATUS.NORMAL,
    comment: "status",
  })
  status: USER_STATUS;

  @Column("varchar", { nullable: true, length: 200, comment: "avatar" })
  avatar: string;
  @Column("tinyint", { nullable: false, default: 0, comment: "gender" })
  gender: number;

  @OneToMany(() => Book, book => book.user)
  books: Book[];

  @OneToMany(() => Account, account => account.user)
  accounts: Account[];

  @OneToMany(() => Category, category => category.user)
  categories: Category[];

}
