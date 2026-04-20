import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

export const cash_flow_REPORT: ReportDefinition = {
  id: 'cash-flow',
  name: 'cash-flow',
  description: 'cash-flow report definition',
  parameters: [],
  run: (params: ReportParams, _ledger: LedgerState): ReportOutput => {
    // TODO(impl): compute cash-flow report rows and totals from LedgerState.
    return {
      title: 'cash-flow',
      subtitle: 'Stub output',
      columns: [],
      rows: [],
      totals: null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
