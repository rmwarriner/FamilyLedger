import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

export const forecast_REPORT: ReportDefinition = {
  id: 'forecast',
  name: 'Cash Flow Forecast',
  description: 'Projects future balances using scheduled transactions and historical averages.',
  parameters: [
    { id: 'horizonDays', label: 'Horizon Days', type: 'number', required: true }
  ],
  run: (params: ReportParams, _ledger: LedgerState): ReportOutput => {
    // TODO(impl): project future balances from scheduled transactions and spending averages.
    // TODO(impl): output a time-series structure optimized for chart rendering.
    // TODO(impl): add Monte Carlo simulation path for uncertainty modelling.
    return {
      title: 'Cash Flow Forecast',
      subtitle: 'Forecast stub',
      columns: [{ id: 'date', label: 'Date' }, { id: 'balance', label: 'Balance' }],
      rows: [],
      totals: null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
