import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, Book, Category, Record } from '@app/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Record,Account,Book,Category])] ,

  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}
