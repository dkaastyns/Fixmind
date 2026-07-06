import { Inject, Injectable } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import type { SessionRow } from '../../../common/types/database-rows';

@Injectable()
export class SessionsRepository {
  constructor(@Inject(SQL_TOKEN) private readonly sql: Sql) {}

  async create(data: {
    userId: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<SessionRow> {
    const [row] = await this.sql<SessionRow[]>`
      INSERT INTO sessions (
        user_id, refresh_token_hash, user_agent, ip_address, expires_at
      )
      VALUES (
        ${data.userId},
        ${data.refreshTokenHash},
        ${data.userAgent ?? null},
        ${data.ipAddress ?? null},
        ${data.expiresAt}
      )
      RETURNING *
    `;
    return row;
  }

  async findValidByTokenHash(hash: string): Promise<SessionRow | null> {
    const [row] = await this.sql<SessionRow[]>`
      SELECT * FROM sessions
      WHERE refresh_token_hash = ${hash}
        AND revoked_at IS NULL
        AND expires_at > now()
      LIMIT 1
    `;
    return row ?? null;
  }

  async revoke(id: string): Promise<void> {
    await this.sql`
      UPDATE sessions SET revoked_at = now() WHERE id = ${id}
    `;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.sql`
      UPDATE sessions SET revoked_at = now()
      WHERE user_id = ${userId} AND revoked_at IS NULL
    `;
  }
}
