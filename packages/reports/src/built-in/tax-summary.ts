import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';
import { aggregateByAccount, baseOutput, sum } from './helpers';

const taxTag = (path: string): string => {
  const lowered = path.toLowerCase();
  if (lowered.includes('tax')) return 'Tax';
  if (lowered.includes('income')) return 'Income';
  if (lowered.includes('expense')) return 'Expense';
  return 'General';
};

export const tax_summary_REPORT: ReportDefinition = {
  id: 'tax-summary',
  name: 'Tax Summary',
  description: 'Categorized income and expense totals for tax review.',
  parameters: [],
  run: (params: ReportParams, ledger: LedgerState): ReportOutput => {
    const rows = aggregateByAccount(
      ledger,
      (account) => account.type === 'INCOME' || account.type === 'EXPENSE'
    ).map((row) => ({
      id: `tax:${row.account.id}`,
      values: {
        category: taxTag(row.account.fullPath),
        account: row.account.fullPath,
        amount: Math.abs(row.amount)
      }
    }));

    return baseOutput(
      'Tax Summary',
      'Income/expense totals by tax category',
      [
        { id: 'category', label: 'Category' },
        { id: 'account', label: 'Account' },
        { id: 'amount', label: 'Amount' }
      ],
      rows,
      {
        id: 'totals',
        values: {
          category: 'Total',
          account: '',
          amount: sum(rows.map((row) => Number(row.values.amount)))
        }
      },
      params
    );
  }
};
