import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

const dailyAverageNet = (ledger: LedgerState): number => {
  if (ledger.entries.length === 0) return 0;

  const sorted = ledger.entries.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
  const start = sorted[0]!.date.getTime();
  const end = sorted[sorted.length - 1]!.date.getTime();
  const spanDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  let net = 0;
  for (const entry of sorted) {
    for (const posting of entry.postings) {
      const account = ledger.accounts[posting.accountId];
      if (!account || account.type !== 'ASSET') continue;
      net += Number(posting.amount.amount.toString());
    }
  }

  return Number((net / spanDays).toFixed(2));
};

export const forecast_REPORT: ReportDefinition = {
  id: 'forecast',
  name: 'Cash Flow Forecast',
  description: 'Projects future balances using historical average net change.',
  parameters: [
    { id: 'horizonDays', label: 'Horizon Days', type: 'number', required: true }
  ],
  run: (params: ReportParams, ledger: LedgerState): ReportOutput => {
    const horizonDays = Math.max(1, Number(params.horizonDays ?? 30));
    const daily = dailyAverageNet(ledger);

    const rows = Array.from({ length: horizonDays }).map((_, index) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() + index + 1);
      return {
        id: `forecast:${index + 1}`,
        values: {
          date: date.toISOString().slice(0, 10),
          projectedDelta: Number((daily * (index + 1)).toFixed(2)),
          model: 'historical-average'
        }
      };
    });

    return {
      title: 'Cash Flow Forecast',
      subtitle: `Projected over ${horizonDays} day(s)`,
      columns: [
        { id: 'date', label: 'Date' },
        { id: 'projectedDelta', label: 'Projected Delta' },
        { id: 'model', label: 'Model' }
      ],
      rows,
      totals: rows.length > 0
        ? {
          id: 'totals',
          values: {
            date: 'Total',
            projectedDelta: Number(rows[rows.length - 1]!.values.projectedDelta),
            model: 'historical-average'
          }
        }
        : null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
