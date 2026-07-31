import { join } from 'node:path';

// Set environment variables before importing script
process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';

import { readdir, readFile } from 'node:fs/promises';
import postgres from 'postgres';

// Mock node:fs/promises
jest.mock('node:fs/promises', () => ({
  readdir: jest.fn().mockResolvedValue(['0001_init.sql', '0002_create.sql']),
  readFile: jest.fn().mockResolvedValue('CREATE TABLE test (id SERIAL);'),
}));

// Mock process.exit and console.log
const mockExit = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {}) as any);
const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});

// Mock postgres client
const mockUnsafe = jest.fn().mockResolvedValue(undefined);
const mockQuery = jest.fn().mockResolvedValue([]);
const mockBegin = jest.fn().mockImplementation(async (callback) => {
  const tx = jest.fn().mockResolvedValue([]);
  (tx as any).unsafe = mockUnsafe;
  return callback(tx);
});
const mockEnd = jest.fn().mockResolvedValue(undefined);

const mockPostgres = jest.fn().mockImplementation(() => {
  const pg = mockQuery;
  (pg as any).begin = mockBegin;
  (pg as any).end = mockEnd;
  return pg;
});

jest.mock('postgres', () => mockPostgres);

describe('Database Migration Runner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs migrations successfully', async () => {
    // Import the migration script to execute it
    // Using require to allow clean isolation and caching control
    await import('../scripts/migrate');

    // Verify it ensures migrations table and reads filenames
    expect(readdir).toHaveBeenCalled();
    expect(readFile).toHaveBeenCalledWith(expect.stringContaining('0001_init.sql'), 'utf-8');
    expect(mockBegin).toHaveBeenCalled();
    expect(mockUnsafe).toHaveBeenCalledWith('CREATE TABLE test (id SERIAL);');
    expect(mockEnd).toHaveBeenCalled();
    expect(mockExit).not.toHaveBeenCalled();
  });
});
