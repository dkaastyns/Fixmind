import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type { CreateMaintenanceDto, UpdateMaintenanceDto } from '../dto/maintenance.dto';

export interface MaintenanceRow {
  id: string;
  room_id: string;
  asset_id: string | null;
  title: string;
  description: string | null;
  frequency: string;
  scheduled_date: Date;
  status: string;
  assigned_to: string | null;
  created_by: string | null;
  completed_at: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MaintenanceDetailRow extends MaintenanceRow {
  room_name: string;
  asset_name: string | null;
  asset_code: string | null;
  technician_name: string | null;
}

@Injectable()
export class MaintenanceRepository {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async findById(id: string): Promise<MaintenanceRow | null> {
    const [row] = await this.sql<MaintenanceRow[]>`
      SELECT * FROM maintenance_schedules WHERE id = ${id} LIMIT 1
    `;
    return row ?? null;
  }

  async findDetail(id: string): Promise<MaintenanceDetailRow | null> {
    const [row] = await this.sql<MaintenanceDetailRow[]>`
      SELECT ms.*,
        rm.name AS room_name,
        a.name AS asset_name, a.asset_code,
        u.full_name AS technician_name
      FROM maintenance_schedules ms
      LEFT JOIN rooms rm ON rm.id = ms.room_id
      LEFT JOIN assets a ON a.id = ms.asset_id
      LEFT JOIN users u ON u.id = ms.assigned_to
      WHERE ms.id = ${id}
      LIMIT 1
    `;
    return row ?? null;
  }

  async list(params: {
    page: number;
    limit: number;
    technicianId?: string;
    status?: string;
    assetId?: string;
  }) {
    const offset = (params.page - 1) * params.limit;

    const rows = await this.sql<MaintenanceDetailRow[]>`
      SELECT ms.*,
        rm.name AS room_name,
        a.name AS asset_name, a.asset_code,
        u.full_name AS technician_name
      FROM maintenance_schedules ms
      LEFT JOIN rooms rm ON rm.id = ms.room_id
      LEFT JOIN assets a ON a.id = ms.asset_id
      LEFT JOIN users u ON u.id = ms.assigned_to
      WHERE 1=1
        ${params.technicianId ? this.sql`AND ms.assigned_to = ${params.technicianId}` : this.sql``}
        ${params.status ? this.sql`AND ms.status = ${params.status}` : this.sql``}
        ${params.assetId ? this.sql`AND ms.asset_id = ${params.assetId}` : this.sql``}
      ORDER BY ms.scheduled_date DESC
      LIMIT ${params.limit} OFFSET ${offset}
    `;

    const [{ count }] = await this.sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM maintenance_schedules ms
      WHERE 1=1
        ${params.technicianId ? this.sql`AND ms.assigned_to = ${params.technicianId}` : this.sql``}
        ${params.status ? this.sql`AND ms.status = ${params.status}` : this.sql``}
        ${params.assetId ? this.sql`AND ms.asset_id = ${params.assetId}` : this.sql``}
    `;

    return { rows, total: Number(count) };
  }

  async create(data: CreateMaintenanceDto & { createdBy?: string }): Promise<MaintenanceRow> {
    // Map frontend frequency to DB frequency
    let dbFrequency = 'ONE_TIME';
    if (data.frequency === 'WEEKLY') dbFrequency = 'WEEKLY';
    else if (data.frequency === 'MONTHLY') dbFrequency = 'MONTHLY';

    const [row] = await this.sql<MaintenanceRow[]>`
      INSERT INTO maintenance_schedules
        (room_id, asset_id, title, description, frequency, scheduled_date, status, assigned_to, created_by)
      VALUES (
        ${data.roomId},
        ${data.assetId ?? null},
        ${data.title},
        ${data.description ?? null},
        ${dbFrequency},
        ${data.scheduledDate},
        'SCHEDULED',
        ${data.technicianId},
        ${data.createdBy ?? null}
      )
      RETURNING *
    `;
    return row;
  }

  async update(id: string, data: UpdateMaintenanceDto): Promise<MaintenanceRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const [row] = await this.sql<MaintenanceRow[]>`
      UPDATE maintenance_schedules SET
        status = ${data.status ?? existing.status},
        notes = ${data.notes !== undefined ? data.notes : existing.notes},
        completed_at = ${data.completedAt !== undefined ? data.completedAt : existing.completed_at},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return row ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.sql`
      DELETE FROM maintenance_schedules WHERE id = ${id}
    `;
    return result.count > 0;
  }
}

