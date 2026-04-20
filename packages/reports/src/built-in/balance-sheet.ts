import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

export const balance_sheet_REPORT: ReportDefinition = {
  id: 'balance-sheet',
  name: 'balance-sheet',
  description: 'balance-sheet report definition',
  parameters: [],
  run: (params: ReportParams, _ledger: LedgerState): ReportOutput => {
    // TODO(impl): compute balance-sheet report rows and totals from LedgerState.
    return {
      title: 'balance-sheet',
      subtitle: 'Stub output',
      columns: [],
      rows: [],
      totals: null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
