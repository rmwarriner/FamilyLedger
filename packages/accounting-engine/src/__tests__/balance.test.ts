import { describe, expect, it } from 'vitest';
import { Money } from '@familyledger/shared';
import { getAccountBalance, getRunningBalance, getTrialBalance } from '../balance';
import type { JournalEntry } from '../types';

describe('balance calculations', () => {
  const entry = (
    id: string,
    date: string,
    postings: JournalEntry['postings']
  ): JournalEntry => ({
    id,
    date: new Date(date),
    description: id,
    payee: null,
    postings,
    tags: [],
    attachments: [],
    isScheduled: false,
    scheduledId: null,
    importedFrom: null,
    importedId: null,
    createdAt: new Date(date),
    updatedAt: new Date(date),
    createdBy: 'test-user'
  });

  it('calculates running balances by posting date and account', () => {
    const entries = [
      entry('e2', '2026-01-03T00:00:00Z', [
        { id: 'p3', accountId: 'cash', amount: Money.from(-15, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
        { id: 'p4', accountId: 'expense', amount: Money.from(15, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
      ]),
      entry('e1', '2026-01-01T00:00:00Z', [
        { id: 'p1', accountId: 'cash', amount: Money.from(100, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
        { id: 'p2', accountId: 'income', amount: Money.from(-100, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
      ]),
      entry('e3', '2026-01-04T00:00:00Z', [
        { id: 'p5', accountId: 'income', amount: Money.from(50, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
        { id: 'p6', accountId: 'equity', amount: Money.from(-50, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
      ])
    ];

    const running = getRunningBalance('cash', entries);
    expect(running.map((row) => row.date.toISOString())).toEqual([
      '2026-01-01T00:00:00.000Z',
      '2026-01-03T00:00:00.000Z'
    ]);
    expect(running.map((row) => row.balance.toString())).toEqual(['100.00', '85.00']);
  });

  it('calculates account balance and trial-balance totals', () => {
    const entries = [
      entry('e1', '2026-01-01T00:00:00Z', [
        { id: 'p1', accountId: 'cash', amount: Money.from(100, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
        { id: 'p2', accountId: 'income', amount: Money.from(-100, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
      ]),
      entry('e2', '2026-01-02T00:00:00Z', [
        { id: 'p3', accountId: 'expense', amount: Money.from(40, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
        { id: 'p4', accountId: 'cash', amount: Money.from(-40, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
      ])
    ];

    const asOf = new Date('2026-01-02T23:59:59Z');
    const cashBalance = getAccountBalance('cash', asOf, entries);
    expect(cashBalance.toString()).toBe('60.00');

    const trial = getTrialBalance(asOf, entries);
    expect(trial.rows).toHaveLength(3);
    expect(trial.totalDebits.toString()).toBe('140.00');
    expect(trial.totalCredits.toString()).toBe('140.00');
  });
});
