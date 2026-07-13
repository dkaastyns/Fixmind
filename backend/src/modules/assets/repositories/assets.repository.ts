import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type {
  AssetRow,
  AssetStatus,
} from '../../../common/types/database-rows';

@Injectable()
export class AssetsRepository {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async findById(id: string, sql: Sql = this.sql): Promise<AssetRow | null> {
    const [row] = await sql<AssetRow[]>`
      SELECT * FROM assets WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
    `;
    return row ?? null;
  }

  async list(params: {
    page: number;
    limit: number;
    roomId?: string;
    status?: AssetStatus;
  }) {
    const offset = (params.page - 1) * params.limit;

    // Use COUNT(*) OVER() window function to get total in a single query
    const result = params.roomId
      ? await this.sql<(AssetRow & { total_count: string })[]>`
          SELECT *, COUNT(*) OVER() AS total_count
          FROM assets WHERE deleted_at IS NULL AND room_id = ${params.roomId}
          ${params.status ? this.sql`AND status = ${params.status}` : this.sql``}
          ORDER BY nama_barang ASC LIMIT ${params.limit} OFFSET ${offset}
        `
      : await this.sql<(AssetRow & { total_count: string })[]>`
          SELECT *, COUNT(*) OVER() AS total_count
          FROM assets WHERE deleted_at IS NULL
          ${params.status ? this.sql`AND status = ${params.status}` : this.sql``}
          ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}
        `;

    const total = result.length > 0 ? Number(result[0].total_count) : 0;
    return { rows: result as AssetRow[], total };
  }

  async search(params: { query: string; limit: number; page?: number }) {
    const offset = ((params.page ?? 1) - 1) * params.limit;
    const q = `%${params.query.trim()}%`;

    // Single query with window function for accurate pagination total
    const result = await this.sql<
      (AssetRow & {
        room_name?: string;
        room_code?: string;
        total_count: string;
      })[]
    >`
      SELECT a.*, r.name AS room_name, r.code AS room_code, COUNT(*) OVER() AS total_count
      FROM assets a
      LEFT JOIN rooms r ON r.id = a.room_id
      WHERE a.deleted_at IS NULL
        AND (
          a.idpemda ILIKE ${q}
          OR a.kode_barang ILIKE ${q}
          OR a.nomor_register ILIKE ${q}
          OR a.nama_barang ILIKE ${q}
          OR a.merk_type ILIKE ${q}
          OR r.name ILIKE ${q}
          OR r.code ILIKE ${q}
        )
      ORDER BY a.nama_barang ASC
      LIMIT ${params.limit} OFFSET ${offset}
    `;

    const total = result.length > 0 ? Number(result[0].total_count) : 0;
    return { rows: result, total };
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

  async upsertMany(
    rows: Array<{
      roomId: string;
      idpemda: string;
      kodeBarang: string;
      nomorRegister: string;
      namaBarang: string;
      merkType: string;
    }>,
  ): Promise<AssetRow[]> {
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

  /**
   * Update an asset by ID. Accepts explicit partial data with current values
   * already merged by the caller — no extra findById round-trip needed.
   */
  async update(id: string, data: Partial<AssetRow>): Promise<AssetRow | null> {
    const [row] = await this.sql<AssetRow[]>`
      UPDATE assets SET
        room_id = ${data.room_id ?? null},
        idpemda = ${data.idpemda ?? null},
        kode_barang = ${data.kode_barang ?? null},
        nomor_register = ${data.nomor_register ?? null},
        nama_barang = ${data.nama_barang ?? null},
        merk_type = ${data.merk_type ?? null},
        status = ${data.status ?? null},
        updated_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;
    return row ?? null;
  }

  async moveToRoom(
    id: string,
    roomId: string,
    sql: Sql = this.sql,
  ): Promise<AssetRow | null> {
    const [row] = await sql<AssetRow[]>`
      UPDATE assets SET
        room_id = ${roomId},
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
