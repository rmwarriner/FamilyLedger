import { Money } from '@familyledger/shared';
import type { BudgetSummary, EnvelopeBudget } from './types';

export const fundEnvelope = (budget: EnvelopeBudget, amount: Money): EnvelopeBudget => ({
  ...budget,
  allocated: budget.allocated.plus(amount),
  available: budget.available.plus(amount)
});

export const applyEnvelopeSpending = (budget: EnvelopeBudget, amount: Money): EnvelopeBudget => {
  const nextSpent = budget.spent.plus(amount);
  const nextAvailable = budget.available.minus(amount);

  if (budget.overspendPolicy === 'BLOCK' && nextAvailable.amount.lessThan(0)) {
    throw new Error('BUDGET_OVESPEND_BLOCKED');
  }

  if (budget.overspendPolicy === 'BORROW_NEXT_MONTH' && nextAvailable.amount.lessThan(0)) {
    return {
      ...budget,
      spent: nextSpent,
      available: Money.from(0, budget.available.currency)
    };
  }

  return {
    ...budget,
    spent: nextSpent,
    available: nextAvailable
  };
};

export const summarizeEnvelope = (budget: EnvelopeBudget): BudgetSummary => ({
  id: budget.id,
  type: 'ENVELOPE',
  name: budget.name,
  target: budget.allocated,
  actual: budget.spent,
  variance: budget.available
});
