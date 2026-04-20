import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportOutput } from '../types';
import type { CustomReportDefinition } from './types';

export const evaluateCustomReport = (
  _definition: CustomReportDefinition,
  _ledger: LedgerState
): ReportOutput => {
  // TODO(impl): evaluate custom report definition against LedgerState.
  return {
    title: 'Custom Report',
    subtitle: 'TODO',
    columns: [],
    rows: [],
    totals: null,
    generatedAt: new Date(),
    parameters: {}
  };
};
