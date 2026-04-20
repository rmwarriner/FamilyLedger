import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams, ReportRow } from '../types';
import { accountById, baseOutput, cashLike, sum } from './helpers';

export const cash_flow_REPORT: ReportDefinition = {
  id: 'cash-flow',
  name: 'Cash Flow',
  description: 'Cash movement by transaction posting.',
  parameters: [],
  run: (params: ReportParams, ledger: LedgerState): ReportOutput => {
    const accounts = accountById(ledger);
    const rows: ReportRow[] = [];

    for (const entry of ledger.entries) {
      for (const posting of entry.postings) {
        const account = accounts.get(posting.accountId);
        if (!account || !cashLike(account)) continue;
        const amount = Number(posting.amount.amount.toString());
        rows.push({
          id: `${entry.id}:${posting.id}`,
          values: {
            date: entry.date.toISOString().slice(0, 10),
            description: entry.description,
            account: account.fullPath,
            inflow: amount > 0 ? amount : 0,
            outflow: amount < 0 ? Math.abs(amount) : 0
          }
        });
      }
    }

    const inflow = sum(rows.map((row) => Number(row.values.inflow)));
    const outflow = sum(rows.map((row) => Number(row.values.outflow)));

    return baseOutput(
      'Cash Flow',
      'Cash inflow and outflow',
      [
        { id: 'date', label: 'Date' },
        { id: 'description', label: 'Description' },
        { id: 'account', label: 'Account' },
        { id: 'inflow', label: 'Inflow' },
        { id: 'outflow', label: 'Outflow' }
      ],
      rows,
      {
        id: 'totals',
        values: {
          date: 'Total',
          description: '',
          account: '',
          inflow,
          outflow
        }
      },
      params
    );
  }
};
