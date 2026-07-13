import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type { AssetTransferRow, AssetTransferStatus } from '../../../common/types/database-rows';

@Injectable()
export class TransferRepository {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async create(
    data: {
      assetId: string;
      requesterId: string;
      fromRoomId: string;
      toRoomId: string;
      reason: string;
      status?: AssetTransferStatus;
      reviewedBy?: string;
      reviewedAt?: Date;
      reviewerNotes?: string;
    },
    sql: Sql = this.sql,
  ): Promise<AssetTransferRow> {
    const [row] = await sql<AssetTransferRow[]>`
      INSERT INTO asset_transfers
        (
          asset_id, requester_id, from_room_id, to_room_id, reason,
          status, reviewed_by, reviewed_at, reviewer_notes
        )
      VALUES
        (
          ${data.assetId}, ${data.requesterId}, ${data.fromRoomId}, ${data.toRoomId}, ${data.reason},
          ${data.status ?? 'PENDING'}, ${data.reviewedBy ?? null}, ${data.reviewedAt ?? null}, ${data.reviewerNotes ?? null}
        )
      RETURNING *
    `;
    return row;
  }

  async findById(id: string, sql: Sql = this.sql): Promise<AssetTransferRow | null> {
    const [row] = await sql<AssetTransferRow[]>`
      SELECT
        t.*,
        a.nama_barang AS asset_name,
        a.kode_barang AS asset_kode,
        fr.name AS from_room_name,
        fr.code AS from_room_code,
        tr.name AS to_room_name,
        tr.code AS to_room_code,
        u.full_name AS requester_name,
        rv.full_name AS reviewer_name
      FROM asset_transfers t
      JOIN assets a ON a.id = t.asset_id
      JOIN rooms fr ON fr.id = t.from_room_id
      JOIN rooms tr ON tr.id = t.to_room_id
      JOIN users u ON u.id = t.requester_id
      LEFT JOIN users rv ON rv.id = t.reviewed_by
      WHERE t.id = ${id}
      LIMIT 1
    `;
    return row ?? null;
  }

  async list(params: {
    status?: AssetTransferStatus;
    requesterId?: string;
    page: number;
    limit: number;
    search?: string;
  }, sql: Sql = this.sql) {
    const offset = (params.page - 1) * params.limit;
    const q = params.search?.trim() ? `%${params.search.trim()}%` : null;

    const rows = await sql<AssetTransferRow[]>`
      SELECT
        t.*,
        a.nama_barang AS asset_name,
        a.kode_barang AS asset_kode,
        fr.name AS from_room_name,
        fr.code AS from_room_code,
        tr.name AS to_room_name,
        tr.code AS to_room_code,
        u.full_name AS requester_name,
        rv.full_name AS reviewer_name
      FROM asset_transfers t
      JOIN assets a ON a.id = t.asset_id
      JOIN rooms fr ON fr.id = t.from_room_id
      JOIN rooms tr ON tr.id = t.to_room_id
      JOIN users u ON u.id = t.requester_id
      LEFT JOIN users rv ON rv.id = t.reviewed_by
      WHERE 1 = 1
        ${params.status ? sql`AND t.status = ${params.status}::asset_transfer_status` : sql``}
        ${params.requesterId ? sql`AND t.requester_id = ${params.requesterId}` : sql``}
        ${q ? sql`
          AND (
            a.nama_barang ILIKE ${q}
            OR a.kode_barang ILIKE ${q}
            OR COALESCE(u.full_name, '') ILIKE ${q}
            OR COALESCE(fr.name, '') ILIKE ${q}
            OR COALESCE(fr.code, '') ILIKE ${q}
            OR COALESCE(tr.name, '') ILIKE ${q}
            OR COALESCE(tr.code, '') ILIKE ${q}
            OR COALESCE(t.reason, '') ILIKE ${q}
            OR COALESCE(t.reviewer_notes, '') ILIKE ${q}
            OR t.status::text ILIKE ${q}
            OR to_char(t.created_at, 'YYYY-MM-DD') ILIKE ${q}
          )
        ` : sql``}
      ORDER BY t.created_at DESC
      LIMIT ${params.limit}
      OFFSET ${offset}
    `;

    const [{ count }] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count
      FROM asset_transfers t
      JOIN assets a ON a.id = t.asset_id
      JOIN rooms fr ON fr.id = t.from_room_id
      JOIN rooms tr ON tr.id = t.to_room_id
      JOIN users u ON u.id = t.requester_id
      WHERE 1 = 1
        ${params.status ? sql`AND t.status = ${params.status}::asset_transfer_status` : sql``}
        ${params.requesterId ? sql`AND t.requester_id = ${params.requesterId}` : sql``}
        ${q ? sql`
          AND (
            a.nama_barang ILIKE ${q}
            OR a.kode_barang ILIKE ${q}
            OR COALESCE(u.full_name, '') ILIKE ${q}
            OR COALESCE(fr.name, '') ILIKE ${q}
            OR COALESCE(fr.code, '') ILIKE ${q}
            OR COALESCE(tr.name, '') ILIKE ${q}
            OR COALESCE(tr.code, '') ILIKE ${q}
            OR COALESCE(t.reason, '') ILIKE ${q}
            OR COALESCE(t.reviewer_notes, '') ILIKE ${q}
            OR t.status::text ILIKE ${q}
            OR to_char(t.created_at, 'YYYY-MM-DD') ILIKE ${q}
          )
        ` : sql``}
    `;

    return { rows, total: Number(count) };
  }

  async review(
    id: string,
    reviewerId: string,
    status: 'APPROVED' | 'REJECTED',
    notes?: string,
    sql: Sql = this.sql,
  ): Promise<AssetTransferRow | null> {
    const [row] = await sql<AssetTransferRow[]>`
      WITH updated AS (
        UPDATE asset_transfers SET
          status = ${status}::asset_transfer_status,
          reviewed_by = ${reviewerId},
          reviewed_at = now(),
          reviewer_notes = ${notes ?? null},
          updated_at = now()
        WHERE id = ${id} AND status = 'PENDING'
        RETURNING *
      )
      SELECT
        u.*,
        a.nama_barang AS asset_name,
        a.kode_barang AS asset_kode,
        fr.name AS from_room_name,
        fr.code AS from_room_code,
        tr.name AS to_room_name,
        tr.code AS to_room_code,
        req.full_name AS requester_name,
        rv.full_name AS reviewer_name
      FROM updated u
      JOIN assets a ON a.id = u.asset_id
      JOIN rooms fr ON fr.id = u.from_room_id
      JOIN rooms tr ON tr.id = u.to_room_id
      JOIN users req ON req.id = u.requester_id
      LEFT JOIN users rv ON rv.id = u.reviewed_by
    `;
    return row ?? null;
  }

  async hasPending(assetId: string, sql: Sql = this.sql): Promise<boolean> {
    const [{ count }] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count
      FROM asset_transfers
      WHERE asset_id = ${assetId} AND status = 'PENDING'
    `;
    return Number(count) > 0;
  }
}
