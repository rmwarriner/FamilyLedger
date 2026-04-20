import { describe, expect, it } from 'vitest';
import { applyGaapRules } from '../gaap';
import type { LedgerState } from '../types';

describe('gaap rules', () => {
  it('returns the current state while GAAP extensions are pending', () => {
    const state: LedgerState = { accounts: {}, entries: [] };
    const output = applyGaapRules(state, { accrualBasis: true });

    expect(output).toBe(state);
  });
});
