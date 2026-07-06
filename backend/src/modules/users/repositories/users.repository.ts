import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type { UserRow } from '../../../common/types/database-rows';

@Injectable()
export class UsersRepository {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const [row] = await this.sql<UserRow[]>`
      SELECT * FROM users WHERE email = ${email} AND deleted_at IS NULL LIMIT 1
    `;
    return row ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const [row] = await this.sql<UserRow[]>`
      SELECT * FROM users WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
    `;
    return row ?? null;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    role: UserRow['role'];
    phone?: string;
  }): Promise<UserRow> {
    const [row] = await this.sql<UserRow[]>`
      INSERT INTO users (email, password_hash, full_name, role, phone)
      VALUES (${data.email}, ${data.passwordHash}, ${data.fullName}, ${data.role}, ${data.phone ?? null})
      RETURNING *
    `;
    return row;
  }

  async update(
    id: string,
    data: Partial<{
      fullName: string;
      role: UserRow['role'];
      phone: string | null;
      isActive: boolean;
      passwordHash: string;
    }>,
  ): Promise<UserRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const [row] = await this.sql<UserRow[]>`
      UPDATE users SET
        full_name = ${data.fullName ?? existing.full_name},
        role = ${data.role ?? existing.role},
        phone = ${data.phone !== undefined ? data.phone : existing.phone},
        is_active = ${data.isActive ?? existing.is_active},
        password_hash = ${data.passwordHash ?? existing.password_hash},
        updated_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;
    return row ?? null;
  }

  async softDelete(id: string): Promise<boolean> {
    const rows = await this.sql`
      UPDATE users SET deleted_at = now(), updated_at = now()
      WHERE id = ${id} AND deleted_at IS NULL
    `;
    return rows.count > 0;
  }

  async list(params: {
    page: number;
    limit: number;
    role?: UserRow['role'];
  }): Promise<{ rows: UserRow[]; total: number }> {
    const offset = (params.page - 1) * params.limit;

    const rows = params.role
      ? await this.sql<UserRow[]>`
          SELECT * FROM users WHERE deleted_at IS NULL AND role = ${params.role}
          ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}
        `
      : await this.sql<UserRow[]>`
          SELECT * FROM users WHERE deleted_at IS NULL
          ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}
        `;

    const [{ count }] = params.role
      ? await this.sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count FROM users
          WHERE deleted_at IS NULL AND role = ${params.role}
        `
      : await this.sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count FROM users WHERE deleted_at IS NULL
        `;

    return { rows, total: Number(count) };
  }

  async listTechnicians(): Promise<UserRow[]> {
    return this.sql<UserRow[]>`
      SELECT * FROM users
      WHERE deleted_at IS NULL AND role = 'TECHNICIAN' AND is_active = TRUE
      ORDER BY full_name ASC
    `;
  }
}
