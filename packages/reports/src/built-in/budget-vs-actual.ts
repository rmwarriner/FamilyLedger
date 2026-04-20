import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';
import { aggregateByAccount, baseOutput, sum } from './helpers';

export const budget_vs_actual_REPORT: ReportDefinition = {
  id: 'budget-vs-actual',
  name: 'Budget vs Actual',
  description: 'Compares heuristic budget targets to actual expense totals.',
  parameters: [],
  run: (params: ReportParams, ledger: LedgerState): ReportOutput => {
    const rows = aggregateByAccount(ledger, (account) => account.type === 'EXPENSE').map((row) => {
      const actual = Math.abs(row.amount);
      const target = Number((actual * 1.1).toFixed(2));
      return {
        id: `budget:${row.account.id}`,
        values: {
          category: row.account.fullPath,
          target,
          actual,
          variance: Number((target - actual).toFixed(2))
        }
      };
    });

    const targetTotal = sum(rows.map((row) => Number(row.values.target)));
    const actualTotal = sum(rows.map((row) => Number(row.values.actual)));

    return baseOutput(
      'Budget vs Actual',
      'Targeted versus actual spending',
      [
        { id: 'category', label: 'Category' },
        { id: 'target', label: 'Target' },
        { id: 'actual', label: 'Actual' },
        { id: 'variance', label: 'Variance' }
      ],
      rows,
      {
        id: 'totals',
        values: {
          category: 'Total',
          target: targetTotal,
          actual: actualTotal,
          variance: Number((targetTotal - actualTotal).toFixed(2))
        }
      },
      params
    );
  }
};
