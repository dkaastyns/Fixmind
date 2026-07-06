import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type { RoomRow } from '../../../common/types/database-rows';

@Injectable()
export class RoomsRepository {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async findById(id: string): Promise<RoomRow | null> {
    const [row] = await this.sql<RoomRow[]>`
      SELECT * FROM rooms WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
    `;
    return row ?? null;
  }

  async list(params: { page: number; limit: number; activeOnly?: boolean }) {
    const offset = (params.page - 1) * params.limit;
    const rows = params.activeOnly
      ? await this.sql<RoomRow[]>`
          SELECT * FROM rooms WHERE deleted_at IS NULL AND is_active = TRUE
          ORDER BY name ASC LIMIT ${params.limit} OFFSET ${offset}
        `
      : await this.sql<RoomRow[]>`
          SELECT * FROM rooms WHERE deleted_at IS NULL
          ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}
        `;

    const [{ count }] = params.activeOnly
      ? await this.sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count FROM rooms
          WHERE deleted_at IS NULL AND is_active = TRUE
        `
      : await this.sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count FROM rooms WHERE deleted_at IS NULL
        `;

    return { rows, total: Number(count) };
  }

  async create(data: {
    name: string;
    code: string;
    floor?: string;
    building?: string;
    description?: string;
  }): Promise<RoomRow> {
    const [row] = await this.sql<RoomRow[]>`
      INSERT INTO rooms (name, code, floor, building, description)
      VALUES (${data.name}, ${data.code}, ${data.floor ?? null}, ${data.building ?? null}, ${data.description ?? null})
      RETURNING *
    `;
    return row;
  }

  async update(id: string, data: Partial<RoomRow>): Promise<RoomRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const [row] = await this.sql<RoomRow[]>`
      UPDATE rooms SET
        name = ${data.name ?? existing.name},
        code = ${data.code ?? existing.code},
        floor = ${data.floor !== undefined ? data.floor : existing.floor},
        building = ${data.building !== undefined ? data.building : existing.building},
        description = ${data.description !== undefined ? data.description : existing.description},
        is_active = ${data.is_active ?? existing.is_active},
        updated_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;
    return row ?? null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.sql`
      UPDATE rooms SET deleted_at = now(), updated_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
    `;
    return result.count > 0;
  }
}
