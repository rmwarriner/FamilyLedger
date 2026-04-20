import { describe, expect, it } from 'vitest';
import { Money } from '@familyledger/shared';
import { summarizeTrackingLine } from '../tracking';

describe('tracking budgeting', () => {
  it('tests tracking budget period rollup', () => {
    const summary = summarizeTrackingLine({
      id: 'housing',
      category: 'Housing',
      target: Money.from(1200, 'USD'),
      actual: Money.from(1105.44, 'USD')
    });

    expect(summary.type).toBe('TRACKING');
    expect(summary.target.toString()).toBe('1200.00');
    expect(summary.actual.toString()).toBe('1105.44');
    expect(summary.variance.toString()).toBe('94.56');
  });
});
