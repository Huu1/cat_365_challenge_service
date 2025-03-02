import { Module } from "@nestjs/common";

import { UserModule } from "./user/user.module";
import { AccountModule } from "./account/account.module";
import { BookModule } from "./book/book.module";
import { RecordModule } from "./record/record.module";
import { CategoryModule } from "./category/category.module";
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [UserModule, BookModule, RecordModule, CategoryModule,AccountModule, AnalysisModule],
})
export class RoutersModule {}
