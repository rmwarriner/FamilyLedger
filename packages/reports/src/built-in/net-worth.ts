import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';
import { aggregateByAccount, baseOutput, sum } from './helpers';

export const net_worth_REPORT: ReportDefinition = {
  id: 'net-worth',
  name: 'Net Worth',
  description: 'Total assets less liabilities.',
  parameters: [],
  run: (params: ReportParams, ledger: LedgerState): ReportOutput => {
    const assetRows = aggregateByAccount(ledger, (account) => account.type === 'ASSET').map((row) => ({
      id: `asset:${row.account.id}`,
      values: { account: row.account.fullPath, amount: Math.abs(row.amount), type: 'ASSET' }
    }));
    const liabilityRows = aggregateByAccount(ledger, (account) => account.type === 'LIABILITY').map((row) => ({
      id: `liability:${row.account.id}`,
      values: { account: row.account.fullPath, amount: Math.abs(row.amount), type: 'LIABILITY' }
    }));

    const assets = sum(assetRows.map((row) => Number(row.values.amount)));
    const liabilities = sum(liabilityRows.map((row) => Number(row.values.amount)));

    return baseOutput(
      'Net Worth',
      'Assets less liabilities',
      [
        { id: 'type', label: 'Type' },
        { id: 'account', label: 'Account' },
        { id: 'amount', label: 'Amount' }
      ],
      [...assetRows, ...liabilityRows],
      {
        id: 'totals',
        values: { type: 'NET_WORTH', account: 'Total', amount: assets - liabilities }
      },
      params
    );
  }
};
