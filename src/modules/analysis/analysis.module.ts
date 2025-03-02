import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from '@app/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
