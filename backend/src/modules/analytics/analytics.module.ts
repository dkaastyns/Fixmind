import { Module } from '@nestjs/common';
import { ReportsModule } from '../reports/reports.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsRepository } from './repositories/analytics.repository';

@Module({
  imports: [ReportsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
