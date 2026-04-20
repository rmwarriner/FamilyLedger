import type { EnvelopeBudget } from './types';

export const rolloverEnvelope = (budget: EnvelopeBudget): EnvelopeBudget => {
  // TODO(impl): carry unspent funds into the next period when rollover is enabled.
  return { ...budget };
};
