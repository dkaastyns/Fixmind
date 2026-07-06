import postgres from 'postgres';

export const SQL_TOKEN = Symbol('SQL_TOKEN');

export type Sql = postgres.Sql;

export function createSqlConnection(databaseUrl: string): Sql {
  return postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: true,
  });
}
