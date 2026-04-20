import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams, ReportRow } from '../types';
import { aggregateByAccount, baseOutput, sum } from './helpers';

export const income_statement_REPORT: ReportDefinition = {
  id: 'income-statement',
  name: 'Income Statement',
  description: 'Summarizes income and expenses for the selected period.',
  parameters: [],
  run: (params: ReportParams, ledger: LedgerState): ReportOutput => {
    const incomeRows = aggregateByAccount(ledger, (account) => account.type === 'INCOME')
      .map<ReportRow>((row) => ({
        id: `income:${row.account.id}`,
        values: { section: 'Income', account: row.account.fullPath, amount: Math.abs(row.amount) }
      }));

    const expenseRows = aggregateByAccount(ledger, (account) => account.type === 'EXPENSE')
      .map<ReportRow>((row) => ({
        id: `expense:${row.account.id}`,
        values: { section: 'Expense', account: row.account.fullPath, amount: Math.abs(row.amount) }
      }));

    const rows = [...incomeRows, ...expenseRows];
    const incomeTotal = sum(incomeRows.map((row) => Number(row.values.amount)));
    const expenseTotal = sum(expenseRows.map((row) => Number(row.values.amount)));

    return baseOutput(
      'Income Statement',
      'Income and expenses by account',
      [
        { id: 'section', label: 'Section' },
        { id: 'account', label: 'Account' },
        { id: 'amount', label: 'Amount' }
      ],
      rows,
      {
        id: 'totals',
        values: {
          section: 'Net Income',
          account: 'Total',
          amount: incomeTotal - expenseTotal
        }
      },
      params
    );
  }
};
