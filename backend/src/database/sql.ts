import postgres from 'postgres';

export const SQL_TOKEN = Symbol('SQL_TOKEN');

export type Sql = postgres.Sql;

export function createSqlConnection(databaseUrl: string): Sql {
  return postgres(databaseUrl, {
    max: 25,
    idle_timeout: 30,
    connect_timeout: 15,
    max_lifetime: 1800,
    prepare: true,
  });
}
