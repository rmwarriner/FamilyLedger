import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams, ReportRow } from '../types';
import { aggregateByAccount, baseOutput, sum } from './helpers';

const sectionAmount = (type: 'ASSET' | 'LIABILITY' | 'EQUITY', ledger: LedgerState): ReportRow[] =>
  aggregateByAccount(ledger, (account) => account.type === type).map((row) => ({
    id: `${type}:${row.account.id}`,
    values: {
      section: type,
      account: row.account.fullPath,
      amount: Math.abs(row.amount)
    }
  }));

export const balance_sheet_REPORT: ReportDefinition = {
  id: 'balance-sheet',
  name: 'Balance Sheet',
  description: 'Snapshot of assets, liabilities, and equity.',
  parameters: [],
  run: (params: ReportParams, ledger: LedgerState): ReportOutput => {
    const assets = sectionAmount('ASSET', ledger);
    const liabilities = sectionAmount('LIABILITY', ledger);
    const equity = sectionAmount('EQUITY', ledger);
    const rows = [...assets, ...liabilities, ...equity];

    const assetsTotal = sum(assets.map((row) => Number(row.values.amount)));
    const liabilitiesTotal = sum(liabilities.map((row) => Number(row.values.amount)));
    const equityTotal = sum(equity.map((row) => Number(row.values.amount)));

    return baseOutput(
      'Balance Sheet',
      'Assets, liabilities, and equity',
      [
        { id: 'section', label: 'Section' },
        { id: 'account', label: 'Account' },
        { id: 'amount', label: 'Amount' }
      ],
      rows,
      {
        id: 'totals',
        values: {
          section: 'Net Worth',
          account: 'Total',
          amount: assetsTotal - liabilitiesTotal + equityTotal
        }
      },
      params
    );
  }
};
