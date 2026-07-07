import { Controller, Get, Header, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReportsRepository } from '../reports/repositories/reports.repository';
import { AnalyticsService } from './services/analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly reportsRepository: ReportsRepository,
  ) {}

  @Get('overview')
  async overview(@CurrentUser() user: AuthUser) {
    if (user.role === 'ADMIN') {
      const data = await this.analyticsService.summary();
      return { message: 'Dashboard overview', data };
    }

    const filters =
      user.role === 'USER'
        ? { reporterId: user.id, page: 1, limit: 1 }
        : { technicianId: user.id, page: 1, limit: 1 };

    const all = await this.reportsRepository.list({ ...filters, page: 1, limit: 1000 });
    const byStatus: Record<string, number> = {};
    for (const r of all.rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    }

    const openStatuses = ['PENDING', 'AI_ANALYSIS', 'REVIEWED', 'ASSIGNED', 'IN_PROGRESS'];
    const data = {
      openReports: openStatuses.reduce((s, k) => s + (byStatus[k] ?? 0), 0),
      inProgress: byStatus['IN_PROGRESS'] ?? 0,
      completedLast30Days: all.rows.filter((r) => r.status === 'COMPLETED').length,
      avgRating: null,
      total: all.total,
    };

    return { message: 'Dashboard overview', data };
  }

  @Roles('ADMIN')
  @Get('summary')
  async summary() {
    const data = await this.analyticsService.summary();
    return { message: 'Analytics summary', data };
  }

  @Roles('ADMIN')
  @Get('export')
  @Header('Content-Type', 'text/csv')
  async export(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const csv = await this.analyticsService.exportCsv(startDate, endDate);
    res.setHeader('Content-Disposition', 'attachment; filename="fixmind-reports.csv"');
    res.send(csv);
  }

  @Roles('ADMIN')
  @Get('technician-stats')
  async technicianStats() {
    const data = await this.analyticsService.technicianStats();
    return { message: 'Technician stats retrieved', data };
  }
}
