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
          ORDER BY nama_barang ASC LIMIT ${params.limit} OFFSET ${offset}
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
    idpemda: string;
    kodeBarang: string;
    nomorRegister: string;
    namaBarang: string;
    merkType: string;
  }): Promise<AssetRow> {
    const [row] = await this.sql<AssetRow[]>`
      INSERT INTO assets (room_id, idpemda, kode_barang, nomor_register, nama_barang, merk_type)
      VALUES (
        ${data.roomId},
        ${data.idpemda},
        ${data.kodeBarang},
        ${data.nomorRegister},
        ${data.namaBarang},
        ${data.merkType}
      )
      RETURNING *
    `;
    return row;
  }

  async upsertMany(rows: Array<{
    roomId: string;
    idpemda: string;
    kodeBarang: string;
    nomorRegister: string;
    namaBarang: string;
    merkType: string;
  }>): Promise<AssetRow[]> {
    const imported: AssetRow[] = [];

    for (const data of rows) {
      const [row] = await this.sql<AssetRow[]>`
        INSERT INTO assets (room_id, idpemda, kode_barang, nomor_register, nama_barang, merk_type)
        VALUES (
          ${data.roomId},
          ${data.idpemda},
          ${data.kodeBarang},
          ${data.nomorRegister},
          ${data.namaBarang},
          ${data.merkType}
        )
        ON CONFLICT (kode_barang) DO UPDATE SET
          room_id = EXCLUDED.room_id,
          idpemda = EXCLUDED.idpemda,
          nomor_register = EXCLUDED.nomor_register,
          nama_barang = EXCLUDED.nama_barang,
          merk_type = EXCLUDED.merk_type,
          deleted_at = NULL,
          updated_at = now()
        RETURNING *
      `;
      imported.push(row);
    }

    return imported;
  }

  async update(id: string, data: Partial<AssetRow>): Promise<AssetRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const [row] = await this.sql<AssetRow[]>`
      UPDATE assets SET
        room_id = ${data.room_id ?? existing.room_id},
        idpemda = ${data.idpemda ?? existing.idpemda},
        kode_barang = ${data.kode_barang ?? existing.kode_barang},
        nomor_register = ${data.nomor_register ?? existing.nomor_register},
        nama_barang = ${data.nama_barang ?? existing.nama_barang},
        merk_type = ${data.merk_type ?? existing.merk_type},
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
