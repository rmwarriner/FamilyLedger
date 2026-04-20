import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

export const account_register_REPORT: ReportDefinition = {
  id: 'account-register',
  name: 'Account Register',
  description: 'Chronological posting register with running balance for one account.',
  parameters: [{ id: 'accountId', label: 'Account', type: 'string', required: false }],
  run: (params: ReportParams, ledger: LedgerState): ReportOutput => {
    const requestedAccountId = typeof params.accountId === 'string' ? params.accountId : null;

    const postings = ledger.entries
      .slice()
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .flatMap((entry) => entry.postings.map((posting) => ({ entry, posting })))
      .filter(({ posting }) => !requestedAccountId || posting.accountId === requestedAccountId);

    let running = 0;
    const rows = postings.map(({ entry, posting }) => {
      const amount = Number(posting.amount.amount.toString());
      running += amount;
      return {
        id: `${entry.id}:${posting.id}`,
        values: {
          date: entry.date.toISOString().slice(0, 10),
          description: entry.description,
          accountId: posting.accountId,
          amount,
          runningBalance: Number(running.toFixed(2))
        }
      };
    });

    return {
      title: 'Account Register',
      subtitle: requestedAccountId ? `Filtered by ${requestedAccountId}` : 'All postings',
      columns: [
        { id: 'date', label: 'Date' },
        { id: 'description', label: 'Description' },
        { id: 'accountId', label: 'Account ID' },
        { id: 'amount', label: 'Amount' },
        { id: 'runningBalance', label: 'Running Balance' }
      ],
      rows,
      totals: rows.length > 0
        ? {
          id: 'totals',
          values: {
            date: 'Total',
            description: '',
            accountId: requestedAccountId ?? 'all',
            amount: Number(rows.reduce((sum, row) => sum + Number(row.values.amount), 0).toFixed(2)),
            runningBalance: Number(running.toFixed(2))
          }
        }
        : null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
