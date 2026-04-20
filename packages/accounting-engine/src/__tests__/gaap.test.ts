import { describe, expect, it } from 'vitest';
import { Money } from '@familyledger/shared';
import { applyGaapRules } from '../gaap';
import type { Account, JournalEntry, LedgerState } from '../types';

describe('gaap rules', () => {
  const account = (input: Partial<Account> & Pick<Account, 'id' | 'name' | 'fullPath' | 'type'>): Account => ({
    id: input.id,
    parentId: input.parentId ?? null,
    name: input.name,
    fullPath: input.fullPath,
    type: input.type,
    subtype: input.subtype ?? '',
    currency: input.currency ?? 'USD',
    isPlaceholder: input.isPlaceholder ?? false,
    isClosed: input.isClosed ?? false,
    openedAt: input.openedAt ?? new Date('2025-01-01T00:00:00Z'),
    closedAt: input.closedAt ?? null,
    notes: input.notes ?? ''
  });

  const entry = (id: string, date: string, postings: JournalEntry['postings']): JournalEntry => ({
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

  it('applies accrual/cash basis toggle for output ledger entries', () => {
    const state: LedgerState = {
      accounts: {
        cash: account({ id: 'cash', name: 'Cash', fullPath: 'Assets:Cash', type: 'ASSET', subtype: 'CASH' }),
        income: account({ id: 'income', name: 'Income', fullPath: 'Income:Salary', type: 'INCOME' }),
        ar: account({ id: 'ar', name: 'A/R', fullPath: 'Assets:A/R', type: 'ASSET', subtype: 'RECEIVABLE' }),
        expense: account({ id: 'expense', name: 'Expense', fullPath: 'Expenses:Food', type: 'EXPENSE' }),
        ap: account({ id: 'ap', name: 'A/P', fullPath: 'Liabilities:A/P', type: 'LIABILITY', subtype: 'PAYABLE' })
      },
      entries: [
        entry('cash-sale', '2026-01-01T00:00:00Z', [
          { id: 'p1', accountId: 'cash', amount: Money.from(50, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
          { id: 'p2', accountId: 'income', amount: Money.from(-50, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
        ]),
        entry('accrual-only', '2026-01-02T00:00:00Z', [
          { id: 'p3', accountId: 'expense', amount: Money.from(20, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
          { id: 'p4', accountId: 'ap', amount: Money.from(-20, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
        ])
      ]
    };

    const accrual = applyGaapRules(state, { accrualBasis: true });
    expect(accrual.entries.map((e) => e.id)).toEqual(['cash-sale', 'accrual-only']);

    const cash = applyGaapRules(state, { accrualBasis: false });
    expect(cash.entries.map((e) => e.id)).toEqual(['cash-sale']);
  });

  it('adds depreciation journal entries for qualifying fixed assets', () => {
    const state: LedgerState = {
      accounts: {
        assetLaptop: account({
          id: 'assetLaptop',
          name: 'Laptop',
          fullPath: 'Assets:Equipment:Laptop',
          type: 'ASSET',
          subtype: 'FIXED_ASSET',
          notes: JSON.stringify({
            depreciation: {
              periodicAmount: '25.00',
              expenseAccountId: 'deprExpense',
              contraAccountId: 'accumDepr'
            }
          })
        }),
        deprExpense: account({
          id: 'deprExpense',
          name: 'Depreciation Expense',
          fullPath: 'Expenses:Depreciation',
          type: 'EXPENSE'
        }),
        accumDepr: account({
          id: 'accumDepr',
          name: 'Accumulated Depreciation',
          fullPath: 'Assets:Equipment:Accumulated Depreciation',
          type: 'ASSET'
        })
      },
      entries: []
    };

    const out = applyGaapRules(state, {
      accrualBasis: true,
      periodEndDate: new Date('2026-01-31T00:00:00Z')
    });

    expect(out.entries).toHaveLength(1);
    expect(out.entries[0]?.description).toContain('Depreciation');
    expect(out.entries[0]?.postings.map((p) => p.amount.toString())).toEqual(['25.00', '-25.00']);
  });

  it('rejects inconsistent account classifications for the same full path', () => {
    const state: LedgerState = {
      accounts: {
        a1: account({ id: 'a1', name: 'Utilities', fullPath: 'Expenses:Utilities', type: 'EXPENSE' }),
        a2: account({ id: 'a2', name: 'Utilities Copy', fullPath: 'Expenses:Utilities', type: 'ASSET' })
      },
      entries: []
    };

    expect(() => applyGaapRules(state, { accrualBasis: true })).toThrow(
      'GAAP_ACCOUNT_CLASSIFICATION_CONFLICT'
    );
  });

  it('generates period-end closing entry for temporary accounts', () => {
    const state: LedgerState = {
      accounts: {
        income: account({ id: 'income', name: 'Income', fullPath: 'Income:Salary', type: 'INCOME' }),
        expense: account({ id: 'expense', name: 'Expense', fullPath: 'Expenses:Food', type: 'EXPENSE' }),
        equity: account({ id: 'equity', name: 'Retained Earnings', fullPath: 'Equity:Retained Earnings', type: 'EQUITY' })
      },
      entries: [
        entry('e1', '2026-01-10T00:00:00Z', [
          { id: 'p1', accountId: 'income', amount: Money.from(-100, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
          { id: 'p2', accountId: 'equity', amount: Money.from(100, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
        ]),
        entry('e2', '2026-01-12T00:00:00Z', [
          { id: 'p3', accountId: 'expense', amount: Money.from(40, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false },
          { id: 'p4', accountId: 'equity', amount: Money.from(-40, 'USD'), memo: '', reconciled: false, reconciledAt: null, cleared: false }
        ])
      ]
    };

    const out = applyGaapRules(state, {
      accrualBasis: true,
      periodEndDate: new Date('2026-01-31T00:00:00Z'),
      generateClosingEntries: true,
      retainedEarningsAccountId: 'equity'
    });

    const closingEntry = out.entries.find((e) => e.id === 'gaap-close-2026-01-31');
    expect(closingEntry).toBeDefined();
    expect(closingEntry?.postings.map((p) => `${p.accountId}:${p.amount.toString()}`)).toEqual([
      'income:100.00',
      'expense:-40.00',
      'equity:-60.00'
    ]);
  });
});
