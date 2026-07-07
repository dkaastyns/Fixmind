import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type { UserRow } from '../../../common/types/database-rows';

@Injectable()
export class UsersRepository {
  private hasIsAdminColumnPromise: Promise<boolean> | null = null;

  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  private async hasIsAdminColumn(): Promise<boolean> {
    if (!this.hasIsAdminColumnPromise) {
      this.hasIsAdminColumnPromise = this.sql<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = 'is_admin'
        ) AS exists
      `.then(([row]) => Boolean(row?.exists));
    }
    return this.hasIsAdminColumnPromise;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const hasIsAdmin = await this.hasIsAdminColumn();
    const [row] = hasIsAdmin
      ? await this.sql<UserRow[]>`
          SELECT
            *,
            CASE WHEN is_admin THEN 'ADMIN' ELSE 'USER' END AS role
          FROM users WHERE email = ${email} AND deleted_at IS NULL LIMIT 1
        `
      : await this.sql<UserRow[]>`
          SELECT
            *,
            CASE WHEN role = 'ADMIN' THEN TRUE ELSE FALSE END AS is_admin
          FROM users WHERE email = ${email} AND deleted_at IS NULL LIMIT 1
        `;
    return row ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const hasIsAdmin = await this.hasIsAdminColumn();
    const [row] = hasIsAdmin
      ? await this.sql<UserRow[]>`
          SELECT
            *,
            CASE WHEN is_admin THEN 'ADMIN' ELSE 'USER' END AS role
          FROM users WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
        `
      : await this.sql<UserRow[]>`
          SELECT
            *,
            CASE WHEN role = 'ADMIN' THEN TRUE ELSE FALSE END AS is_admin
          FROM users WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
        `;
    return row ?? null;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    isAdmin?: boolean;
    phone?: string;
  }): Promise<UserRow> {
    const hasIsAdmin = await this.hasIsAdminColumn();
    const [row] = hasIsAdmin
      ? await this.sql<UserRow[]>`
          INSERT INTO users (email, password_hash, full_name, is_admin, phone)
          VALUES (${data.email}, ${data.passwordHash}, ${data.fullName}, ${data.isAdmin ?? false}, ${data.phone ?? null})
          RETURNING *,
            CASE WHEN is_admin THEN 'ADMIN' ELSE 'USER' END AS role
        `
      : await this.sql<UserRow[]>`
          INSERT INTO users (email, password_hash, full_name, role, phone)
          VALUES (${data.email}, ${data.passwordHash}, ${data.fullName}, ${data.isAdmin ? 'ADMIN' : 'USER'}, ${data.phone ?? null})
          RETURNING *,
            CASE WHEN role = 'ADMIN' THEN TRUE ELSE FALSE END AS is_admin
        `;
    return row;
  }

  async update(
    id: string,
    data: Partial<{
      fullName: string;
      isAdmin: boolean;
      phone: string | null;
      isActive: boolean;
      passwordHash: string;
    }>,
  ): Promise<UserRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const hasIsAdmin = await this.hasIsAdminColumn();
    const [row] = hasIsAdmin
      ? await this.sql<UserRow[]>`
          UPDATE users SET
            full_name = ${data.fullName ?? existing.full_name},
            is_admin = ${data.isAdmin ?? existing.is_admin},
            phone = ${data.phone !== undefined ? data.phone : existing.phone},
            is_active = ${data.isActive ?? existing.is_active},
            password_hash = ${data.passwordHash ?? existing.password_hash},
            updated_at = now()
          WHERE id = ${id} AND deleted_at IS NULL
          RETURNING *,
            CASE WHEN is_admin THEN 'ADMIN' ELSE 'USER' END AS role
        `
        : await this.sql<UserRow[]>`
          UPDATE users SET
            full_name = ${data.fullName ?? existing.full_name},
            role = ${(data.isAdmin ?? existing.is_admin) ? 'ADMIN' : 'USER'},
            phone = ${data.phone !== undefined ? data.phone : existing.phone},
            is_active = ${data.isActive ?? existing.is_active},
            password_hash = ${data.passwordHash ?? existing.password_hash},
            updated_at = now()
          WHERE id = ${id} AND deleted_at IS NULL
          RETURNING *,
            CASE WHEN role = 'ADMIN' THEN TRUE ELSE FALSE END AS is_admin
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
    isAdmin?: boolean;
  }): Promise<{ rows: UserRow[]; total: number }> {
    const offset = (params.page - 1) * params.limit;
    const hasIsAdmin = await this.hasIsAdminColumn();

    const rows = params.isAdmin !== undefined
      ? hasIsAdmin
        ? await this.sql<UserRow[]>`
            SELECT
              *,
              CASE WHEN is_admin THEN 'ADMIN' ELSE 'USER' END AS role
            FROM users WHERE deleted_at IS NULL AND is_admin = ${params.isAdmin}
            ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}
          `
        : await this.sql<UserRow[]>`
            SELECT
              *,
              CASE WHEN role = 'ADMIN' THEN TRUE ELSE FALSE END AS is_admin
            FROM users WHERE deleted_at IS NULL AND role = ${params.isAdmin ? 'ADMIN' : 'USER'}
            ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}
          `
      : hasIsAdmin
        ? await this.sql<UserRow[]>`
            SELECT
              *,
              CASE WHEN is_admin THEN 'ADMIN' ELSE 'USER' END AS role
            FROM users WHERE deleted_at IS NULL
            ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}
          `
        : await this.sql<UserRow[]>`
            SELECT
              *,
              CASE WHEN role = 'ADMIN' THEN TRUE ELSE FALSE END AS is_admin
            FROM users WHERE deleted_at IS NULL
            ORDER BY created_at DESC LIMIT ${params.limit} OFFSET ${offset}
          `;

    const [{ count }] = params.isAdmin !== undefined
      ? hasIsAdmin
        ? await this.sql<{ count: string }[]>`
            SELECT COUNT(*)::text AS count FROM users
            WHERE deleted_at IS NULL AND is_admin = ${params.isAdmin}
          `
        : await this.sql<{ count: string }[]>`
            SELECT COUNT(*)::text AS count FROM users
            WHERE deleted_at IS NULL AND role = ${params.isAdmin ? 'ADMIN' : 'USER'}
          `
      : await this.sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count FROM users WHERE deleted_at IS NULL
        `;

    return { rows, total: Number(count) };
  }
}
