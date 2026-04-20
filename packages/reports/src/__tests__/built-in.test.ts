import { describe, expect, it } from 'vitest';
import type { LedgerState } from '@familyledger/accounting-engine';
import {
  account_register_REPORT,
  balance_sheet_REPORT,
  budget_vs_actual_REPORT,
  cash_flow_REPORT,
  forecast_REPORT,
  income_statement_REPORT,
  net_worth_REPORT,
  spending_by_category_REPORT,
  tax_summary_REPORT
} from '../index';

const fakeMoney = (value: number) =>
  ({
    amount: { toString: () => value.toString() },
    currency: 'USD'
  } as any);

const sampleLedger = (): LedgerState => ({
  accounts: {
    checking: {
      id: 'checking', parentId: null, name: 'Checking', fullPath: 'Assets:Checking', type: 'ASSET', subtype: 'BANK', currency: 'USD',
      isPlaceholder: false, isClosed: false, openedAt: new Date('2026-01-01'), closedAt: null, notes: ''
    },
    groceries: {
      id: 'groceries', parentId: null, name: 'Groceries', fullPath: 'Expenses:Groceries', type: 'EXPENSE', subtype: 'FOOD', currency: 'USD',
      isPlaceholder: false, isClosed: false, openedAt: new Date('2026-01-01'), closedAt: null, notes: ''
    },
    income: {
      id: 'income', parentId: null, name: 'Income', fullPath: 'Income:Salary', type: 'INCOME', subtype: 'SALARY', currency: 'USD',
      isPlaceholder: false, isClosed: false, openedAt: new Date('2026-01-01'), closedAt: null, notes: ''
    },
    credit: {
      id: 'credit', parentId: null, name: 'Credit Card', fullPath: 'Liabilities:Credit Card', type: 'LIABILITY', subtype: 'CARD', currency: 'USD',
      isPlaceholder: false, isClosed: false, openedAt: new Date('2026-01-01'), closedAt: null, notes: ''
    },
    equity: {
      id: 'equity', parentId: null, name: 'Equity', fullPath: 'Equity:Opening', type: 'EQUITY', subtype: 'OPENING', currency: 'USD',
      isPlaceholder: false, isClosed: false, openedAt: new Date('2026-01-01'), closedAt: null, notes: ''
    }
  },
  entries: [
    {
      id: 'e1', date: new Date('2026-01-01'), description: 'Paycheck', payee: 'Employer',
      postings: [
        { id: 'p1', accountId: 'checking', amount: fakeMoney(1000), memo: '', reconciled: false, reconciledAt: null, cleared: false },
        { id: 'p2', accountId: 'income', amount: fakeMoney(-1000), memo: '', reconciled: false, reconciledAt: null, cleared: false }
      ],
      tags: ['salary'], attachments: [], isScheduled: false, scheduledId: null, importedFrom: null, importedId: null,
      createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'), createdBy: 'test'
    },
    {
      id: 'e2', date: new Date('2026-01-02'), description: 'Groceries', payee: 'Store',
      postings: [
        { id: 'p3', accountId: 'groceries', amount: fakeMoney(120.5), memo: '', reconciled: false, reconciledAt: null, cleared: false },
        { id: 'p4', accountId: 'checking', amount: fakeMoney(-120.5), memo: '', reconciled: false, reconciledAt: null, cleared: false }
      ],
      tags: ['food'], attachments: [], isScheduled: false, scheduledId: null, importedFrom: null, importedId: null,
      createdAt: new Date('2026-01-02'), updatedAt: new Date('2026-01-02'), createdBy: 'test'
    }
  ]
});

describe('built-in reports', () => {
  it('validates built-in report output shape and totals', () => {
    const ledger = sampleLedger();
    const outputs = [
      income_statement_REPORT.run({}, ledger),
      balance_sheet_REPORT.run({}, ledger),
      cash_flow_REPORT.run({}, ledger),
      net_worth_REPORT.run({}, ledger),
      budget_vs_actual_REPORT.run({}, ledger),
      spending_by_category_REPORT.run({}, ledger),
      tax_summary_REPORT.run({}, ledger),
      account_register_REPORT.run({ accountId: 'checking' }, ledger),
      forecast_REPORT.run({ horizonDays: 5 }, ledger)
    ];

    for (const output of outputs) {
      expect(output.title.length).toBeGreaterThan(0);
      expect(Array.isArray(output.columns)).toBe(true);
      expect(Array.isArray(output.rows)).toBe(true);
      expect(output.generatedAt).toBeInstanceOf(Date);
    }

    expect(outputs[0]!.totals).not.toBeNull();
    expect(Number(outputs[0]!.totals!.values.amount)).toBeCloseTo(879.5);
    expect(outputs[7]!.rows.length).toBeGreaterThan(0);
    expect(outputs[8]!.rows).toHaveLength(5);
  });
});
