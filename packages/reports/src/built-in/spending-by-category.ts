import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

export const spending_by_category_REPORT: ReportDefinition = {
  id: 'spending-by-category',
  name: 'spending-by-category',
  description: 'spending-by-category report definition',
  parameters: [],
  run: (params: ReportParams, _ledger: LedgerState): ReportOutput => {
    // TODO(impl): compute spending-by-category report rows and totals from LedgerState.
    return {
      title: 'spending-by-category',
      subtitle: 'Stub output',
      columns: [],
      rows: [],
      totals: null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
