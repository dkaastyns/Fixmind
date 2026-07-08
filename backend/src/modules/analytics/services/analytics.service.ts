import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repositories/analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async summary() {
    return this.analyticsRepository.summary();
  }

  async exportCsv(startDate?: string, endDate?: string): Promise<string> {
    const rows = await this.analyticsRepository.exportRows(startDate, endDate);
    const header = 'ID,Judul Laporan,Status,Prioritas,Ruangan,Pelapor,Dibuat Pada,Selesai Pada\n';
    const body = rows
      .map((r) =>
        [
          r.id,
          `"${String(r.title).replace(/"/g, '""')}"`,
          r.status,
          r.priority ?? '',
          `"${String(r.room).replace(/"/g, '""')}"`,
          `"${String(r.reporter).replace(/"/g, '""')}"`,
          r.created_at,
          r.completed_at ?? '',
        ].join(','),
      )
      .join('\n');
    return header + body;
  }
}
