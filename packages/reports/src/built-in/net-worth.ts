import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportDefinition, ReportOutput, ReportParams } from '../types';

export const net_worth_REPORT: ReportDefinition = {
  id: 'net-worth',
  name: 'net-worth',
  description: 'net-worth report definition',
  parameters: [],
  run: (params: ReportParams, _ledger: LedgerState): ReportOutput => {
    // TODO(impl): compute net-worth report rows and totals from LedgerState.
    return {
      title: 'net-worth',
      subtitle: 'Stub output',
      columns: [],
      rows: [],
      totals: null,
      generatedAt: new Date(),
      parameters: params
    };
  }
};
