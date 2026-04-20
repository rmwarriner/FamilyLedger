import { describe, expect, it } from 'vitest';
import { Money } from '@familyledger/shared';
import { applyEnvelopeSpending, fundEnvelope } from '../envelope';
import { rolloverEnvelope } from '../rollover';
import type { EnvelopeBudget } from '../types';

const sampleBudget = (overrides: Partial<EnvelopeBudget> = {}): EnvelopeBudget => ({
  id: 'groceries',
  name: 'Groceries',
  allocated: Money.from(100, 'USD'),
  spent: Money.from(20, 'USD'),
  available: Money.from(80, 'USD'),
  rolloverEnabled: true,
  overspendPolicy: 'WARN_ONLY',
  ...overrides
});

describe('envelope budgeting', () => {
  it('tests envelope funding workflow', () => {
    const funded = fundEnvelope(sampleBudget(), Money.from(15, 'USD'));
    expect(funded.allocated.toString()).toBe('115.00');
    expect(funded.available.toString()).toBe('95.00');

    const rolled = rolloverEnvelope(funded);
    expect(rolled.allocated.toString()).toBe('95.00');
    expect(rolled.spent.toString()).toBe('0.00');
    expect(rolled.available.toString()).toBe('95.00');
  });

  it('tests envelope overspend policy handling', () => {
    const warned = applyEnvelopeSpending(sampleBudget(), Money.from(95, 'USD'));
    expect(warned.available.toString()).toBe('-15.00');

    const blocked = sampleBudget({ overspendPolicy: 'BLOCK' });
    expect(() => applyEnvelopeSpending(blocked, Money.from(95, 'USD'))).toThrow('BUDGET_OVESPEND_BLOCKED');

    const borrowed = sampleBudget({ overspendPolicy: 'BORROW_NEXT_MONTH' });
    const borrowedResult = applyEnvelopeSpending(borrowed, Money.from(95, 'USD'));
    expect(borrowedResult.available.toString()).toBe('0.00');
  });
});
