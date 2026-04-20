import { describe, expect, it } from 'vitest';
import { Money } from '@familyledger/shared';
import { reverseJournalEntry, validateJournalEntry } from '../ledger';
import type { JournalEntry } from '../types';

const sampleEntry = (): JournalEntry => ({
  id: 'entry-1',
  date: new Date('2026-01-01T00:00:00Z'),
  description: 'Sample',
  payee: 'Payee',
  postings: [
    { id: 'p1', accountId: 'a1', amount: Money.from(10, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
    { id: 'p2', accountId: 'a2', amount: Money.from(-10, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
  ],
  tags: [],
  attachments: [],
  isScheduled: false,
  scheduledId: null,
  importedFrom: null,
  importedId: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  createdBy: 'user-1'
});

describe('ledger validation', () => {
  it('validates balanced entries', () => {
    const result = validateJournalEntry(sampleEntry());
    expect(result.ok).toBe(true);
  });

  it('rejects imbalanced entries', () => {
    const entry = sampleEntry();
    entry.postings[1]!.amount = Money.from(-9, 'USD');
    const result = validateJournalEntry(entry);
    expect(result.ok).toBe(false);
  });

  it('generates reversal entries', () => {
    const reversal = reverseJournalEntry(sampleEntry());
    expect(reversal.id).toContain('reversal');
  });
});
