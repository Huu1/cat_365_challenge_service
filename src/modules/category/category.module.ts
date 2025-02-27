import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@app/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],

  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
