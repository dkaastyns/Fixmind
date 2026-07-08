import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import { ReportsRepository } from '../../reports/repositories/reports.repository';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @Inject(SQL_TOKEN) private readonly sql: Sql,
    private readonly reportsRepository: ReportsRepository,
  ) {}

  async summary() {
    const byStatus = await this.reportsRepository.countByStatus();
    const completedLast30 = await this.reportsRepository.countCompletedLast30Days();

    const openStatuses = ['PENDING', 'AI_ANALYSIS', 'REVIEWED', 'ASSIGNED', 'IN_PROGRESS'];
    const openReports = openStatuses.reduce((sum, s) => sum + (byStatus[s] ?? 0), 0);

    const byPriority = await this.sql<{ priority: string; count: string }[]>`
      SELECT COALESCE(priority::text, 'UNSET') AS priority, COUNT(*)::text AS count
      FROM reports WHERE deleted_at IS NULL
      GROUP BY priority
    `;

    const byRoom = await this.sql<{ room_name: string; count: string }[]>`
      SELECT rm.name AS room_name, COUNT(*)::text AS count
      FROM reports r
      JOIN rooms rm ON rm.id = r.room_id
      WHERE r.deleted_at IS NULL
      GROUP BY rm.name
      ORDER BY count DESC
      LIMIT 8
    `;

    return {
      openReports,
      inProgress: byStatus['IN_PROGRESS'] ?? 0,
      completedLast30Days: completedLast30,
      avgRating: null,
      byStatus,
      byPriority: Object.fromEntries(byPriority.map((r) => [r.priority, Number(r.count)])),
      byRoom: byRoom.map((r) => ({ room: r.room_name, count: Number(r.count) })),
    };
  }

  async exportRows(startDate?: string, endDate?: string) {
    return this.sql`
      SELECT r.id, r.title, r.status::text, r.priority::text,
        rm.name AS room, u.full_name AS reporter,
        r.created_at, r.completed_at
      FROM reports r
      JOIN rooms rm ON rm.id = r.room_id
      JOIN users u ON u.id = r.reporter_id
      WHERE r.deleted_at IS NULL
        ${startDate ? this.sql`AND r.created_at >= ${startDate}` : this.sql``}
        ${endDate ? this.sql`AND r.created_at <= ${endDate}::timestamp + interval '1 day' - interval '1 millisecond'` : this.sql``}
      ORDER BY r.created_at DESC
    `;
  }
}
