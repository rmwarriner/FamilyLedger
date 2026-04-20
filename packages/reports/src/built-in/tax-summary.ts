import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

export const tax_summary_REPORT: ReportDefinition = {
  id: 'tax-summary',
  name: 'tax-summary',
  description: 'tax-summary report definition',
  parameters: [],
  run: (params: ReportParams, _ledger: LedgerState): ReportOutput => {
    // TODO(impl): compute tax-summary report rows and totals from LedgerState.
    return {
      title: 'tax-summary',
      subtitle: 'Stub output',
      columns: [],
      rows: [],
      totals: null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
