import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type { MaintenanceScheduleRow, MaintenanceScheduleStatus } from '../../../common/types/database-rows';

export interface MaintenanceListRow extends MaintenanceScheduleRow {
  room_name: string | null;
  room_code: string | null;
  asset_name: string | null;
  asset_kode: string | null;
  created_by_name: string | null;
}

@Injectable()
export class MaintenanceRepository {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async findById(id: string, sql: Sql = this.sql): Promise<MaintenanceListRow | null> {
    const [row] = await sql<MaintenanceListRow[]>`
      SELECT
        m.*,
        rm.name AS room_name,
        rm.code AS room_code,
        a.nama_barang AS asset_name,
        a.kode_barang AS asset_kode,
        u.full_name AS created_by_name
      FROM maintenance_schedules m
      LEFT JOIN rooms rm ON rm.id = m.room_id
      LEFT JOIN assets a ON a.id = m.asset_id
      LEFT JOIN users u ON u.id = m.created_by
      WHERE m.id = ${id}
      LIMIT 1
    `;
    return row ?? null;
  }

  async list(params: {
    page: number;
    limit: number;
    status?: MaintenanceScheduleStatus;
    search?: string;
  }) {
    const offset = (params.page - 1) * params.limit;
    const q = params.search?.trim() ? `%${params.search.trim()}%` : null;

    const rows = await this.sql<MaintenanceListRow[]>`
      SELECT
        m.*,
        rm.name AS room_name,
        rm.code AS room_code,
        a.nama_barang AS asset_name,
        a.kode_barang AS asset_kode,
        u.full_name AS created_by_name
      FROM maintenance_schedules m
      LEFT JOIN rooms rm ON rm.id = m.room_id
      LEFT JOIN assets a ON a.id = m.asset_id
      LEFT JOIN users u ON u.id = m.created_by
      WHERE 1 = 1
        ${params.status ? this.sql`AND m.status = ${params.status}::maintenance_schedule_status` : this.sql``}
        ${q ? this.sql`
          AND (
            m.title ILIKE ${q}
            OR COALESCE(m.description, '') ILIKE ${q}
            OR COALESCE(m.assignee_name, '') ILIKE ${q}
            OR COALESCE(m.vendor_contact_name, '') ILIKE ${q}
            OR COALESCE(m.vendor_phone, '') ILIKE ${q}
            OR COALESCE(m.notes, '') ILIKE ${q}
            OR COALESCE(rm.name, '') ILIKE ${q}
            OR COALESCE(rm.code, '') ILIKE ${q}
            OR COALESCE(a.nama_barang, '') ILIKE ${q}
            OR COALESCE(a.kode_barang, '') ILIKE ${q}
            OR m.frequency::text ILIKE ${q}
            OR m.status::text ILIKE ${q}
            OR to_char(m.scheduled_date, 'YYYY-MM-DD') ILIKE ${q}
          )
        ` : this.sql``}
      ORDER BY m.scheduled_date ASC, m.created_at DESC
      LIMIT ${params.limit}
      OFFSET ${offset}
    `;

    const [{ count }] = await this.sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count
      FROM maintenance_schedules m
      LEFT JOIN rooms rm ON rm.id = m.room_id
      LEFT JOIN assets a ON a.id = m.asset_id
      WHERE 1 = 1
        ${params.status ? this.sql`AND m.status = ${params.status}::maintenance_schedule_status` : this.sql``}
        ${q ? this.sql`
          AND (
            m.title ILIKE ${q}
            OR COALESCE(m.description, '') ILIKE ${q}
            OR COALESCE(m.assignee_name, '') ILIKE ${q}
            OR COALESCE(m.vendor_contact_name, '') ILIKE ${q}
            OR COALESCE(m.vendor_phone, '') ILIKE ${q}
            OR COALESCE(m.notes, '') ILIKE ${q}
            OR COALESCE(rm.name, '') ILIKE ${q}
            OR COALESCE(rm.code, '') ILIKE ${q}
            OR COALESCE(a.nama_barang, '') ILIKE ${q}
            OR COALESCE(a.kode_barang, '') ILIKE ${q}
            OR m.frequency::text ILIKE ${q}
            OR m.status::text ILIKE ${q}
            OR to_char(m.scheduled_date, 'YYYY-MM-DD') ILIKE ${q}
          )
        ` : this.sql``}
    `;

    return { rows, total: Number(count) };
  }

  async create(data: {
    roomId?: string;
    assetId?: string;
    title: string;
    description?: string;
    frequency: MaintenanceScheduleRow['frequency'];
    scheduledDate: string;
    status: MaintenanceScheduleStatus;
    assigneeType: MaintenanceScheduleRow['assignee_type'];
    assigneeName: string;
    vendorContactName?: string;
    vendorPhone?: string;
    estimatedCost?: number;
    notes?: string;
    createdBy?: string;
  }) {
    const [row] = await this.sql<MaintenanceScheduleRow[]>`
      INSERT INTO maintenance_schedules (
        room_id, asset_id, title, description, frequency, scheduled_date, status,
        assignee_type, assignee_name, vendor_contact_name, vendor_phone, estimated_cost,
        notes, created_by
      )
      VALUES (
        ${data.roomId ?? null},
        ${data.assetId ?? null},
        ${data.title},
        ${data.description ?? null},
        ${data.frequency}::maintenance_frequency,
        ${data.scheduledDate}::date,
        ${data.status}::maintenance_schedule_status,
        ${data.assigneeType}::maintenance_assignee_type,
        ${data.assigneeName},
        ${data.vendorContactName ?? null},
        ${data.vendorPhone ?? null},
        ${data.estimatedCost ?? 0},
        ${data.notes ?? null},
        ${data.createdBy ?? null}
      )
      RETURNING *
    `;
    return row;
  }

  async update(id: string, data: Partial<{
    roomId: string | null;
    assetId: string | null;
    title: string;
    description: string | null;
    frequency: MaintenanceScheduleRow['frequency'];
    scheduledDate: string;
    status: MaintenanceScheduleStatus;
    assigneeType: MaintenanceScheduleRow['assignee_type'];
    assigneeName: string;
    vendorContactName: string | null;
    vendorPhone: string | null;
    estimatedCost: number;
    notes: string | null;
    completedAt: Date | null;
  }>): Promise<MaintenanceScheduleRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const [row] = await this.sql<MaintenanceScheduleRow[]>`
      UPDATE maintenance_schedules SET
        room_id = ${data.roomId !== undefined ? data.roomId : existing.room_id},
        asset_id = ${data.assetId !== undefined ? data.assetId : existing.asset_id},
        title = ${data.title ?? existing.title},
        description = ${data.description !== undefined ? data.description : existing.description},
        frequency = ${data.frequency ? this.sql`${data.frequency}::maintenance_frequency` : this.sql`${existing.frequency}::maintenance_frequency`},
        scheduled_date = ${data.scheduledDate ? this.sql`${data.scheduledDate}::date` : this.sql`${existing.scheduled_date}::date`},
        status = ${data.status ? this.sql`${data.status}::maintenance_schedule_status` : this.sql`${existing.status}::maintenance_schedule_status`},
        assignee_type = ${data.assigneeType ? this.sql`${data.assigneeType}::maintenance_assignee_type` : this.sql`${existing.assignee_type}::maintenance_assignee_type`},
        assignee_name = ${data.assigneeName ?? existing.assignee_name},
        vendor_contact_name = ${data.vendorContactName !== undefined ? data.vendorContactName : existing.vendor_contact_name},
        vendor_phone = ${data.vendorPhone !== undefined ? data.vendorPhone : existing.vendor_phone},
        estimated_cost = ${data.estimatedCost !== undefined ? data.estimatedCost : Number(existing.estimated_cost ?? 0)},
        notes = ${data.notes !== undefined ? data.notes : existing.notes},
        completed_at = ${data.completedAt !== undefined ? data.completedAt : existing.completed_at},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return row ?? null;
  }

  async updateStatus(id: string, status: MaintenanceScheduleStatus, notes?: string, completedAt?: Date | null) {
    const [row] = await this.sql<MaintenanceScheduleRow[]>`
      UPDATE maintenance_schedules SET
        status = ${status}::maintenance_schedule_status,
        notes = ${notes ?? null},
        completed_at = ${completedAt ?? null},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return row ?? null;
  }

  async delete(id: string) {
    const result = await this.sql`
      DELETE FROM maintenance_schedules WHERE id = ${id}
    `;
    return result.count > 0;
  }
}
