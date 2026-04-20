import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

export const income_statement_REPORT: ReportDefinition = {
  id: 'income-statement',
  name: 'income-statement',
  description: 'income-statement report definition',
  parameters: [],
  run: (params: ReportParams, _ledger: LedgerState): ReportOutput => {
    // TODO(impl): compute income-statement report rows and totals from LedgerState.
    return {
      title: 'income-statement',
      subtitle: 'Stub output',
      columns: [],
      rows: [],
      totals: null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
