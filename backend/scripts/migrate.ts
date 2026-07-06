import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id          SERIAL PRIMARY KEY,
      filename    VARCHAR(255) NOT NULL UNIQUE,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const rows = await sql<{ filename: string }[]>`
    SELECT filename FROM schema_migrations ORDER BY id
  `;
  return new Set(rows.map((r) => r.filename));
}

async function run() {
  const migrationsDir = join(__dirname, '..', 'migrations');
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file}`);
      continue;
    }

    const content = await readFile(join(migrationsDir, file), 'utf-8');
    console.log(`apply ${file}`);

    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx`
        INSERT INTO schema_migrations (filename) VALUES (${file})
      `;
    });
  }

  console.log('Migrations complete.');
  await sql.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
