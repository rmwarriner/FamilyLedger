import type { BudgetSummary, TrackingBudgetLine } from './types';

export const summarizeTrackingLine = (line: TrackingBudgetLine): BudgetSummary => ({
  id: line.id,
  type: 'TRACKING',
  name: line.category,
  target: line.target,
  actual: line.actual,
  variance: line.target.minus(line.actual)
});
