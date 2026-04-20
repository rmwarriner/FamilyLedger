import { describe, expect, it } from 'vitest';
import { getTableColumns } from 'drizzle-orm';
import { accounts, auditLog, journalEntries, postings } from '../index';

describe('schema definitions', () => {
  it('validates required table and column definitions', () => {
    expect(accounts[Symbol.for('drizzle:Name') as unknown as keyof typeof accounts]).toBe('accounts');
    expect(journalEntries[Symbol.for('drizzle:Name') as unknown as keyof typeof journalEntries]).toBe(
      'journal_entries'
    );
    expect(postings[Symbol.for('drizzle:Name') as unknown as keyof typeof postings]).toBe('postings');

    expect(Object.keys(getTableColumns(accounts))).toEqual(
      expect.arrayContaining(['id', 'parentId', 'name', 'fullPath', 'type', 'currency'])
    );
    expect(Object.keys(getTableColumns(journalEntries))).toEqual(
      expect.arrayContaining(['id', 'date', 'description', 'isScheduled', 'createdBy'])
    );
    expect(Object.keys(getTableColumns(postings))).toEqual(
      expect.arrayContaining(['id', 'journalEntryId', 'accountId', 'amount', 'cleared'])
    );
  });

  it('validates append-only audit log columns and hash chain fields', () => {
    const cols = getTableColumns(auditLog);

    expect(Object.keys(cols)).toEqual(
      expect.arrayContaining([
        'id',
        'occurredAt',
        'operation',
        'tableName',
        'recordId',
        'beforeJson',
        'afterJson',
        'prevHash',
        'thisHash'
      ])
    );
    expect(cols.thisHash.notNull).toBe(true);
    expect(cols.createdAt.notNull).toBe(true);
    expect(cols.updatedAt.notNull).toBe(true);
    expect(Object.keys(cols)).not.toContain('deletedAt');
  });
});
