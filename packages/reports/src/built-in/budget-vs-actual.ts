import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

export const budget_vs_actual_REPORT: ReportDefinition = {
  id: 'budget-vs-actual',
  name: 'budget-vs-actual',
  description: 'budget-vs-actual report definition',
  parameters: [],
  run: (params: ReportParams, _ledger: LedgerState): ReportOutput => {
    // TODO(impl): compute budget-vs-actual report rows and totals from LedgerState.
    return {
      title: 'budget-vs-actual',
      subtitle: 'Stub output',
      columns: [],
      rows: [],
      totals: null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
