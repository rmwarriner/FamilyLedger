import { Money } from '@familyledger/shared';
import type { EnvelopeBudget } from './types';

export const rolloverEnvelope = (budget: EnvelopeBudget): EnvelopeBudget => {
  const carry = budget.rolloverEnabled && budget.available.amount.greaterThan(0)
    ? budget.available
    : Money.from(0, budget.available.currency);

  return {
    ...budget,
    allocated: carry,
    spent: Money.from(0, budget.spent.currency),
    available: carry
  };
};
