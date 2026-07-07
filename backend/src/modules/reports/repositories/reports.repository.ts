import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type {
  RatingRow,
  ReportHistoryRow,
  ReportPriority,
  ReportRow,
  ReportStatus,
} from '../../../common/types/database-rows';

export interface ReportListRow extends ReportRow {
  room_name: string;
  room_code: string;
  asset_name: string | null;
  reporter_name: string;
  technician_name: string | null;
}

@Injectable()
export class ReportsRepository {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async findById(id: string): Promise<ReportRow | null> {
    const [row] = await this.sql<ReportRow[]>`
      SELECT * FROM reports WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
    `;
    return row ?? null;
  }

  async findDetail(id: string): Promise<ReportListRow | null> {
    const [row] = await this.sql<ReportListRow[]>`
      SELECT r.*,
        rm.name AS room_name, rm.code AS room_code,
        a.name AS asset_name,
        u.full_name AS reporter_name,
        t.full_name AS technician_name
      FROM reports r
      JOIN rooms rm ON rm.id = r.room_id
      JOIN users u ON u.id = r.reporter_id
      LEFT JOIN assets a ON a.id = r.asset_id
      LEFT JOIN users t ON t.id = r.assigned_technician_id
      WHERE r.id = ${id} AND r.deleted_at IS NULL
      LIMIT 1
    `;
    return row ?? null;
  }

  async list(params: {
    page: number;
    limit: number;
    reporterId?: string;
    technicianId?: string;
    status?: ReportStatus;
    startDate?: string;
    endDate?: string;
  }) {
    const offset = (params.page - 1) * params.limit;

    const rows = await this.sql<ReportListRow[]>`
      SELECT r.*,
        rm.name AS room_name, rm.code AS room_code,
        a.name AS asset_name,
        u.full_name AS reporter_name,
        t.full_name AS technician_name
      FROM reports r
      JOIN rooms rm ON rm.id = r.room_id
      JOIN users u ON u.id = r.reporter_id
      LEFT JOIN assets a ON a.id = r.asset_id
      LEFT JOIN users t ON t.id = r.assigned_technician_id
      WHERE r.deleted_at IS NULL
        ${params.reporterId ? this.sql`AND r.reporter_id = ${params.reporterId}` : this.sql``}
        ${params.technicianId ? this.sql`AND r.assigned_technician_id = ${params.technicianId}` : this.sql``}
        ${params.status ? this.sql`AND r.status = ${params.status}` : this.sql``}
        ${params.startDate ? this.sql`AND r.created_at >= ${params.startDate}` : this.sql``}
        ${params.endDate ? this.sql`AND r.created_at <= ${params.endDate}::timestamp + interval '1 day' - interval '1 millisecond'` : this.sql``}
      ORDER BY r.created_at DESC
      LIMIT ${params.limit} OFFSET ${offset}
    `;

    const [{ count }] = await this.sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM reports r
      WHERE r.deleted_at IS NULL
        ${params.reporterId ? this.sql`AND r.reporter_id = ${params.reporterId}` : this.sql``}
        ${params.technicianId ? this.sql`AND r.assigned_technician_id = ${params.technicianId}` : this.sql``}
        ${params.status ? this.sql`AND r.status = ${params.status}` : this.sql``}
        ${params.startDate ? this.sql`AND r.created_at >= ${params.startDate}` : this.sql``}
        ${params.endDate ? this.sql`AND r.created_at <= ${params.endDate}::timestamp + interval '1 day' - interval '1 millisecond'` : this.sql``}
    `;

    return { rows, total: Number(count) };
  }

  async create(data: {
    reporterId: string;
    roomId: string;
    assetId?: string;
    title: string;
    description: string;
  }): Promise<ReportRow> {
    const [row] = await this.sql<ReportRow[]>`
      INSERT INTO reports (reporter_id, room_id, asset_id, title, description, status)
      VALUES (${data.reporterId}, ${data.roomId}, ${data.assetId ?? null}, ${data.title}, ${data.description}, 'PENDING')
      RETURNING *
    `;
    return row;
  }

  async updateStatus(id: string, status: ReportStatus, extra?: {
    completedAt?: Date | null;
    assignedTechnicianId?: string | null;
    assignedAt?: Date | null;
    targetCompletionDate?: Date | null;
    adminNotes?: string;
    priority?: ReportPriority;
  }): Promise<ReportRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const [row] = await this.sql<ReportRow[]>`
      UPDATE reports SET
        status = ${status},
        completed_at = ${extra?.completedAt !== undefined ? extra.completedAt : existing.completed_at},
        assigned_technician_id = ${extra?.assignedTechnicianId !== undefined ? extra.assignedTechnicianId : existing.assigned_technician_id},
        assigned_at = ${extra?.assignedAt !== undefined ? extra.assignedAt : existing.assigned_at},
        target_completion_date = ${extra?.targetCompletionDate !== undefined ? extra.targetCompletionDate : existing.target_completion_date},
        admin_notes = ${extra?.adminNotes !== undefined ? extra.adminNotes : existing.admin_notes},
        priority = ${extra?.priority !== undefined ? extra.priority : existing.priority},
        updated_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;
    return row ?? null;
  }

  async updateAiFields(id: string, data: {
    priority?: ReportPriority;
    aiPriorityScore?: number;
    aiPriorityReason?: string;
    aiRecommendation?: string;
    aiEstimatedRepairHours?: number;
    aiSuggestedTargetDate?: Date;
    aiSuggestedAction?: string;
    aiAnalysisStatus: 'COMPLETED' | 'FAILED';
  }): Promise<void> {
    await this.sql`
      UPDATE reports SET
        status = CASE WHEN status = 'PENDING' THEN 'AI_ANALYSIS'::report_status ELSE status END,
        priority = COALESCE(${data.priority ?? null}, priority),
        ai_priority_score = ${data.aiPriorityScore ?? null},
        ai_priority_reason = ${data.aiPriorityReason ?? null},
        ai_recommendation = ${data.aiRecommendation ?? null},
        ai_estimated_repair_hours = ${data.aiEstimatedRepairHours ?? null},
        ai_suggested_target_date = ${data.aiSuggestedTargetDate ?? null},
        ai_suggested_action = ${data.aiSuggestedAction ?? null},
        ai_analysis_status = ${data.aiAnalysisStatus},
        updated_at = now()
      WHERE id = ${id}
    `;
  }

  async addHistory(data: {
    reportId: string;
    actorId?: string;
    action: string;
    oldStatus?: ReportStatus;
    newStatus?: ReportStatus;
    note?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.sql`
      INSERT INTO report_histories (report_id, actor_id, action, old_status, new_status, note, metadata)
      VALUES (
        ${data.reportId},
        ${data.actorId ?? null},
        ${data.action}::report_history_action,
        ${data.oldStatus ?? null},
        ${data.newStatus ?? null},
        ${data.note ?? null},
        ${JSON.stringify(data.metadata ?? {})}
      )
    `;
  }

  async getHistories(reportId: string): Promise<ReportHistoryRow[]> {
    return this.sql<ReportHistoryRow[]>`
      SELECT * FROM report_histories WHERE report_id = ${reportId}
      ORDER BY created_at ASC
    `;
  }

  async createRating(data: {
    reportId: string;
    userId: string;
    score: number;
    comment?: string;
  }): Promise<RatingRow> {
    const [row] = await this.sql<RatingRow[]>`
      INSERT INTO ratings (report_id, user_id, score, comment)
      VALUES (${data.reportId}, ${data.userId}, ${data.score}, ${data.comment ?? null})
      RETURNING *
    `;
    return row;
  }

  async getRating(reportId: string): Promise<RatingRow | null> {
    const [row] = await this.sql<RatingRow[]>`
      SELECT * FROM ratings WHERE report_id = ${reportId} LIMIT 1
    `;
    return row ?? null;
  }

  async countByStatus(): Promise<Record<string, number>> {
    const rows = await this.sql<{ status: string; count: string }[]>`
      SELECT status::text, COUNT(*)::text AS count
      FROM reports WHERE deleted_at IS NULL
      GROUP BY status
    `;
    return Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
  }

  async avgRating(): Promise<number | null> {
    const [row] = await this.sql<{ avg: string | null }[]>`
      SELECT AVG(score)::text AS avg FROM ratings
    `;
    return row?.avg ? Number(row.avg) : null;
  }

  async countCompletedLast30Days(): Promise<number> {
    const [row] = await this.sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM reports
      WHERE deleted_at IS NULL AND status = 'COMPLETED'
        AND completed_at >= now() - interval '30 days'
    `;
    return Number(row.count);
  }

  async addAttachment(data: {
    reportId: string;
    uploadedBy: string;
    type: string;
    cloudinaryPublicId: string;
    url: string;
  }): Promise<void> {
    await this.sql`
      INSERT INTO report_attachments (report_id, uploaded_by, type, cloudinary_public_id, url)
      VALUES (
        ${data.reportId},
        ${data.uploadedBy},
        ${data.type}::attachment_type,
        ${data.cloudinaryPublicId},
        ${data.url}
      )
    `;
  }

  async getAttachments(reportId: string): Promise<any[]> {
    return this.sql`
      SELECT * FROM report_attachments WHERE report_id = ${reportId}
      ORDER BY created_at ASC
    `;
  }

  async addComment(reportId: string, authorId: string, content: string): Promise<any> {
    const [row] = await this.sql`
      INSERT INTO report_comments (report_id, author_id, content)
      VALUES (${reportId}, ${authorId}, ${content})
      RETURNING *
    `;
    return row;
  }

  async getComments(reportId: string): Promise<any[]> {
    return this.sql`
      SELECT rc.*, u.full_name AS author_name, u.role AS author_role
      FROM report_comments rc
      JOIN users u ON u.id = rc.author_id
      WHERE rc.report_id = ${reportId}
      ORDER BY rc.created_at ASC
    `;
  }
}
