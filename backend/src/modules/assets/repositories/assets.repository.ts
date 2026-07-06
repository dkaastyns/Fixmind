import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type { AssetRow, AssetStatus } from '../../../common/types/database-rows';

@Injectable()
export class AssetsRepository {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async findById(id: string): Promise<AssetRow | null> {
    const [row] = await this.sql<AssetRow[]>`
      SELECT * FROM assets WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
    `;
    return row ?? null;
  }

  async list(params: { page: number; limit: number; roomId?: string; status?: AssetStatus }) {
    const offset = (params.page - 1) * params.limit;

    const rows = params.roomId
      ? await this.sql<AssetRow[]>`
          SELECT * FROM assets WHERE deleted_at IS NULL AND room_id = ${params.roomId}
          ${params.status ? this.sql`AND status = ${params.status}` : this.sql``}
          ORDER BY name ASC LIMIT ${params.limit} OFFSET ${offset}
        `
      : await this.sql<AssetRow[]>`
          SELECT * FROM assets WHERE deleted_at IS NULL
          ${params.status ? this.sql`AND status = ${params.status}` : this.sql``}
          ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}
        `;

    const [{ count }] = params.roomId
      ? await this.sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count FROM assets
          WHERE deleted_at IS NULL AND room_id = ${params.roomId}
          ${params.status ? this.sql`AND status = ${params.status}` : this.sql``}
        `
      : await this.sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count FROM assets WHERE deleted_at IS NULL
          ${params.status ? this.sql`AND status = ${params.status}` : this.sql``}
        `;

    return { rows, total: Number(count) };
  }

  async create(data: {
    roomId: string;
    name: string;
    assetCode: string;
    category: string;
    description?: string;
  }): Promise<AssetRow> {
    const [row] = await this.sql<AssetRow[]>`
      INSERT INTO assets (room_id, name, asset_code, category, description)
      VALUES (${data.roomId}, ${data.name}, ${data.assetCode}, ${data.category}, ${data.description ?? null})
      RETURNING *
    `;
    return row;
  }

  async update(id: string, data: Partial<AssetRow>): Promise<AssetRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const [row] = await this.sql<AssetRow[]>`
      UPDATE assets SET
        room_id = ${data.room_id ?? existing.room_id},
        name = ${data.name ?? existing.name},
        asset_code = ${data.asset_code ?? existing.asset_code},
        category = ${data.category ?? existing.category},
        description = ${data.description !== undefined ? data.description : existing.description},
        status = ${data.status ?? existing.status},
        updated_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;
    return row ?? null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.sql`
      UPDATE assets SET deleted_at = now(), updated_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
    `;
    return result.count > 0;
  }
}
