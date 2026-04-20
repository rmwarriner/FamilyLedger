import { Money } from '@familyledger/shared';
import type { BudgetSummary, EnvelopeBudget } from './types';

export const fundEnvelope = (budget: EnvelopeBudget, amount: Money): EnvelopeBudget => ({
  ...budget,
  allocated: budget.allocated.plus(amount),
  available: budget.available.plus(amount)
});

export const applyEnvelopeSpending = (budget: EnvelopeBudget, amount: Money): EnvelopeBudget => {
  // TODO(impl): enforce configurable overspending policies (warn/block/borrow next month).
  return {
    ...budget,
    spent: budget.spent.plus(amount),
    available: budget.available.minus(amount)
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
