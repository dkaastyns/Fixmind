import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repositories/analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async summary() {
    return this.analyticsRepository.summary();
  }

  async exportCsv(): Promise<string> {
    const rows = await this.analyticsRepository.exportRows();
    const header = 'id,title,status,priority,room,reporter,technician,created_at,completed_at\n';
    const body = rows
      .map((r) =>
        [
          r.id,
          `"${String(r.title).replace(/"/g, '""')}"`,
          r.status,
          r.priority ?? '',
          `"${String(r.room).replace(/"/g, '""')}"`,
          `"${String(r.reporter).replace(/"/g, '""')}"`,
          r.technician ? `"${String(r.technician).replace(/"/g, '""')}"` : '',
          r.created_at,
          r.completed_at ?? '',
        ].join(','),
      )
      .join('\n');
    return header + body;
  }

  async technicianStats() {
    const rows = await this.analyticsRepository.technicianStats();
    return rows.map((r) => ({
      technicianId: r.technician_id,
      technicianName: r.name,
      completedTasks: Number(r.completed),
      avgRating: r.avg_rating ? Number(parseFloat(r.avg_rating).toFixed(2)) : null,
      avgCompletionHours: r.avg_completion_hours
        ? Number(parseFloat(r.avg_completion_hours).toFixed(2))
        : null,
    }));
  }
}
