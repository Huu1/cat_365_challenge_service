import { BeforeInsert, BeforeUpdate, Column } from "typeorm";

import { getCurrentTime } from "@app/helpers/utils.helper";

export abstract class TimeEntityBase {
  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  createdAt: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: false,
  })
  updatedAt: Date;
}
