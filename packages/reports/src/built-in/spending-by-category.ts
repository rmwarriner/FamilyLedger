import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';
import { aggregateByAccount, baseOutput, sum } from './helpers';

export const spending_by_category_REPORT: ReportDefinition = {
  id: 'spending-by-category',
  name: 'Spending by Category',
  description: 'Expense totals grouped by account category.',
  parameters: [],
  run: (params: ReportParams, ledger: LedgerState): ReportOutput => {
    const rows = aggregateByAccount(ledger, (account) => account.type === 'EXPENSE').map((row) => ({
      id: `expense:${row.account.id}`,
      values: {
        category: row.account.fullPath,
        amount: Math.abs(row.amount)
      }
    }));

    return baseOutput(
      'Spending by Category',
      'Expense totals by category account',
      [
        { id: 'category', label: 'Category' },
        { id: 'amount', label: 'Amount' }
      ],
      rows,
      {
        id: 'totals',
        values: { category: 'Total', amount: sum(rows.map((row) => Number(row.values.amount))) }
      },
      params
    );
  }
};
