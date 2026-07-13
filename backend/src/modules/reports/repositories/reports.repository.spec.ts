import { Sql } from '../../../database/sql';
import { ReportsRepository } from './reports.repository';

describe('ReportsRepository', () => {
  it('includes the room and user joins in the count query when filtering by search', async () => {
    const queries: string[] = [];
    const sql = jest.fn(
      (strings: TemplateStringsArray, ...values: unknown[]) => {
        const query = strings.reduce((acc, str, index) => {
          const val = values[index];
          const valStr =
            typeof val === 'string' || typeof val === 'number'
              ? String(val)
              : '';
          return acc + str + valStr;
        }, '');
        queries.push(query);

        return queries.length === 1 ? [{ id: 'report-1' }] : [{ count: '1' }];
      },
    ) as unknown as Sql;

    const repository = new ReportsRepository(sql);

    await repository.list({ page: 1, limit: 10, search: 'room' });

    const countQuery = queries.find(
      (query) =>
        query.includes('FROM reports r') &&
        query.includes('JOIN rooms rm ON rm.id = r.room_id') &&
        query.includes('JOIN users u ON u.id = r.reporter_id'),
    );

    expect(countQuery).toBeDefined();
    expect(countQuery).toContain('FROM reports r');
    expect(countQuery).toContain('JOIN rooms rm ON rm.id = r.room_id');
    expect(countQuery).toContain('JOIN users u ON u.id = r.reporter_id');
  });
});
