import type { ReportDefinition, ReportOutput, ReportParams } from './types';
import type { LedgerState } from '@familyledger/accounting-engine';

export interface ReportRenderer {
  render(definition: ReportDefinition, params: ReportParams, ledger: LedgerState): ReportOutput;
}

export const defaultRenderer: ReportRenderer = {
  render(definition, params, ledger) {
    return definition.run(params, ledger);
  }
};
