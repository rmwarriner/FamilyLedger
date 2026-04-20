import type { LedgerState } from './types';

export interface GaapOptions {
  accrualBasis: boolean;
}

export const applyGaapRules = (_state: LedgerState, _options: GaapOptions): LedgerState => {
  // TODO(impl): support accrual versus cash basis toggles for report generation and posting behavior.
  // TODO(impl): support depreciation schedules for qualifying household assets.
  // TODO(impl): enforce account classification consistency across period boundaries.
  // TODO(impl): generate period-end closing entries for temporary income and expense accounts.
  return _state;
};
